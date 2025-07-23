from rest_framework import status, generics, filters
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q, F
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
import openai
from django.conf import settings
import requests
import whisper
import tempfile
import os
from urllib.parse import parse_qs, urlparse

from .models import Blog, BlogLike, BlogBookmark, Tag
from .serializers import (
    BlogListSerializer,
    BlogDetailSerializer,
    BlogCreateUpdateSerializer,
    TagSerializer
)

# Set OpenAI API key
openai.api_key = settings.OPENAI_API_KEY

class BlogListCreateView(generics.ListCreateAPIView):
    queryset = Blog.objects.filter(is_published=True)
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['layout_type', 'tags__name', 'author__username']
    search_fields = ['title', 'content', 'tags__name', 'author__username']
    ordering_fields = ['created_at', 'likes_count', 'views_count']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BlogCreateUpdateSerializer
        return BlogListSerializer
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class BlogDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Blog.objects.filter(is_published=True)
    lookup_field = 'slug'
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return BlogCreateUpdateSerializer
        return BlogDetailSerializer
    
    def get_object(self):
        obj = super().get_object()
        # Increment view count
        Blog.objects.filter(pk=obj.pk).update(views_count=F('views_count') + 1)
        return obj
    
    def perform_update(self, serializer):
        # Only allow author to update
        if serializer.instance.author != self.request.user:
            raise PermissionError("You can only edit your own blogs.")
        serializer.save()
    
    def perform_destroy(self, instance):
        # Only allow author to delete
        if instance.author != self.request.user:
            raise PermissionError("You can only delete your own blogs.")
        instance.delete()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def like_blog(request, blog_id):
    blog = get_object_or_404(Blog, id=blog_id, is_published=True)
    like, created = BlogLike.objects.get_or_create(blog=blog, user=request.user)
    
    if not created:
        like.delete()
        blog.likes_count = max(0, blog.likes_count - 1)
        blog.save()
        return Response({'liked': False, 'likes_count': blog.likes_count})
    
    blog.likes_count += 1
    blog.save()
    return Response({'liked': True, 'likes_count': blog.likes_count})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bookmark_blog(request, blog_id):
    blog = get_object_or_404(Blog, id=blog_id, is_published=True)
    bookmark, created = BlogBookmark.objects.get_or_create(blog=blog, user=request.user)
    
    if not created:
        bookmark.delete()
        return Response({'bookmarked': False})
    
    return Response({'bookmarked': True})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_blogs(request):
    blogs = Blog.objects.filter(author=request.user)
    serializer = BlogListSerializer(blogs, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def bookmarked_blogs(request):
    bookmarked_blog_ids = BlogBookmark.objects.filter(user=request.user).values_list('blog_id', flat=True)
    blogs = Blog.objects.filter(id__in=bookmarked_blog_ids, is_published=True)
    serializer = BlogListSerializer(blogs, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_blog_content(request):
    prompt = request.data.get('prompt', '')
    if not prompt:
        return Response({'error': 'Prompt is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not settings.OPENAI_API_KEY:
        return Response({'error': 'OpenAI API key not configured'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that writes engaging blog posts. Create well-structured, informative content with a clear introduction, main points, and conclusion."},
                {"role": "user", "content": f"Write a blog post about: {prompt}"}
            ],
            max_tokens=1500,
            temperature=0.7
        )
        
        content = response.choices[0].message.content
        # Generate a title from the first line or create one
        lines = content.split('\n')
        title = lines[0].strip().replace('#', '').strip() if lines else f"Blog about {prompt}"
        
        return Response({
            'title': title,
            'content': content
        })
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def extract_youtube_audio_url(youtube_url):
    """Extract YouTube video ID and return download info"""
    try:
        # Parse YouTube URL
        parsed_url = urlparse(youtube_url)
        if 'youtube.com' in parsed_url.netloc:
            video_id = parse_qs(parsed_url.query)['v'][0]
        elif 'youtu.be' in parsed_url.netloc:
            video_id = parsed_url.path[1:]
        else:
            return None
        
        return f"https://www.youtube.com/watch?v={video_id}"
    except:
        return None

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def generate_blog_from_video(request):
    youtube_url = request.data.get('youtube_url', '')
    video_file = request.FILES.get('video_file')
    
    if not youtube_url and not video_file:
        return Response({'error': 'Either YouTube URL or video file is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Initialize Whisper model
        model = whisper.load_model("base")
        transcript = ""
        
        if video_file:
            # Save uploaded file temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as tmp_file:
                for chunk in video_file.chunks():
                    tmp_file.write(chunk)
                tmp_file_path = tmp_file.name
            
            # Transcribe the video file
            result = model.transcribe(tmp_file_path)
            transcript = result["text"]
            
            # Clean up temporary file
            os.unlink(tmp_file_path)
        
        elif youtube_url:
            # For production, you'd want to use youtube-dl or similar
            # This is a simplified version
            return Response({'error': 'YouTube URL processing not implemented in this demo. Please upload a video file instead.'}, status=status.HTTP_501_NOT_IMPLEMENTED)
        
        if not transcript:
            return Response({'error': 'Could not extract transcript from video'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate blog content from transcript using OpenAI
        if settings.OPENAI_API_KEY:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that converts video transcripts into well-structured blog posts. Create engaging content with proper formatting, headings, and a clear narrative flow."},
                    {"role": "user", "content": f"Convert this video transcript into a comprehensive blog post:\n\n{transcript}"}
                ],
                max_tokens=2000,
                temperature=0.7
            )
            
            content = response.choices[0].message.content
            # Extract title from the generated content
            lines = content.split('\n')
            title = lines[0].strip().replace('#', '').strip() if lines else "Blog from Video"
        else:
            # Fallback if OpenAI is not available
            title = "Blog from Video Transcript"
            content = f"# Blog from Video\n\n{transcript}"
        
        return Response({
            'title': title,
            'content': content,
            'transcript': transcript
        })
    
    except Exception as e:
        return Response({'error': f'Error processing video: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def tags(request):
    tags = Tag.objects.all().order_by('name')
    serializer = TagSerializer(tags, many=True)
    return Response(serializer.data)
