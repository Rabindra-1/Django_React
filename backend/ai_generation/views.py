from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.conf import settings
from django.core.files.storage import default_storage
from openai import OpenAI
import time
import requests
import os
import base64
from PIL import Image
from io import BytesIO
from .models import GeneratedContent, ImageGeneration
from .serializers import GeneratedContentSerializer, ImageGenerationSerializer

# Initialize OpenAI client
client = OpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_text(request):
    """Generate text content using OpenAI GPT"""
    prompt = request.data.get('prompt', '')
    if not prompt:
        return Response({'error': 'Prompt is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not client:
        return Response({'error': 'OpenAI API key not configured'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    start_time = time.time()
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that creates engaging blog content. Be creative, informative, and format your response well with headings and paragraphs."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1500,
            temperature=0.7
        )
        
        content = response.choices[0].message.content
        processing_time = time.time() - start_time
        
        # Save to database
        generated_content = GeneratedContent.objects.create(
            user=request.user,
            content_type='text',
            prompt=prompt,
            result=content,
            processing_time=processing_time,
            success=True
        )
        
        return Response({
            'id': generated_content.id,
            'content': content,
            'processing_time': processing_time
        })
    
    except Exception as e:
        processing_time = time.time() - start_time
        
        # Save failed attempt
        GeneratedContent.objects.create(
            user=request.user,
            content_type='text',
            prompt=prompt,
            processing_time=processing_time,
            success=False,
            error_message=str(e)
        )
        
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_image(request):
    """Generate image using OpenAI DALL-E"""
    prompt = request.data.get('prompt', '')
    style = request.data.get('style', 'realistic')
    
    if not prompt:
        return Response({'error': 'Prompt is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not settings.OPENAI_API_KEY:
        return Response({'error': 'OpenAI API key not configured'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    start_time = time.time()
    
    try:
        # Enhance prompt based on style
        style_prompts = {
            'realistic': f"A realistic, high-quality photograph of {prompt}",
            'artistic': f"An artistic, creative interpretation of {prompt}",
            'cartoon': f"A cartoon-style illustration of {prompt}",
            'abstract': f"An abstract artistic representation of {prompt}"
        }
        
        enhanced_prompt = style_prompts.get(style, prompt)
        
        response = openai.Image.create(
            prompt=enhanced_prompt,
            n=1,
            size="1024x1024"
        )
        
        image_url = response['data'][0]['url']
        processing_time = time.time() - start_time
        
        # Save to database
        image_generation = ImageGeneration.objects.create(
            user=request.user,
            prompt=prompt,
            style=style,
            image_url=image_url,
            success=True
        )
        
        # Also save in GeneratedContent for unified tracking
        GeneratedContent.objects.create(
            user=request.user,
            content_type='image',
            prompt=prompt,
            result=image_url,
            processing_time=processing_time,
            success=True,
            metadata={'style': style, 'image_generation_id': image_generation.id}
        )
        
        return Response({
            'id': image_generation.id,
            'image_url': image_url,
            'style': style,
            'processing_time': processing_time
        })
    
    except Exception as e:
        processing_time = time.time() - start_time
        
        # Save failed attempt
        ImageGeneration.objects.create(
            user=request.user,
            prompt=prompt,
            style=style,
            success=False,
            error_message=str(e)
        )
        
        GeneratedContent.objects.create(
            user=request.user,
            content_type='image',
            prompt=prompt,
            processing_time=processing_time,
            success=False,
            error_message=str(e)
        )
        
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_youtube_url(request):
    """Process YouTube URL to extract content for blog generation"""
    youtube_url = request.data.get('youtube_url', '')
    
    if not youtube_url:
        return Response({'error': 'YouTube URL is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    start_time = time.time()
    
    try:
        # For demonstration purposes, return a mock response
        # In production, you'd want to integrate with youtube-dl or similar
        
        processing_time = time.time() - start_time
        
        mock_transcript = f"This is a mock transcript extracted from the YouTube video at {youtube_url}. In a real implementation, you would use youtube-dl or similar library to extract the actual audio and transcribe it using Whisper or another speech-to-text service."
        
        # Generate blog content from the mock transcript
        if settings.OPENAI_API_KEY:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that converts video content into well-structured blog posts. Create engaging content with proper formatting and headings."},
                    {"role": "user", "content": f"Convert this video content into a comprehensive blog post: {mock_transcript}"}
                ],
                max_tokens=2000,
                temperature=0.7
            )
            
            blog_content = response.choices[0].message.content
        else:
            blog_content = f"# Blog from YouTube Video\n\n{mock_transcript}"
        
        # Save to database
        generated_content = GeneratedContent.objects.create(
            user=request.user,
            content_type='youtube',
            prompt=youtube_url,
            result=blog_content,
            processing_time=processing_time,
            success=True,
            metadata={
                'transcript': mock_transcript,
                'video_url': youtube_url
            }
        )
        
        return Response({
            'id': generated_content.id,
            'blog_content': blog_content,
            'transcript': mock_transcript,
            'processing_time': processing_time,
            'note': 'This is a demo response. Full YouTube processing requires additional setup.'
        })
    
    except Exception as e:
        processing_time = time.time() - start_time
        
        GeneratedContent.objects.create(
            user=request.user,
            content_type='youtube',
            prompt=youtube_url,
            processing_time=processing_time,
            success=False,
            error_message=str(e)
        )
        
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_video_content(request):
    """Generate video content description and settings"""
    title = request.data.get('title', '')
    description = request.data.get('description', '')
    
    if not title and not description:
        return Response({'error': 'Title or description is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    start_time = time.time()
    
    try:
        prompt = f"Create a detailed video script and production notes for a video with title: '{title}' and description: '{description}'"
        
        if settings.OPENAI_API_KEY:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a creative video production assistant. Create detailed video scripts, shot lists, and production notes."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=2000,
                temperature=0.7
            )
            
            content = response.choices[0].message.content
        else:
            content = f"# Video Production Plan\n\n**Title:** {title}\n**Description:** {description}\n\nThis is a placeholder for video generation. Full video generation requires additional AI video services."
        
        processing_time = time.time() - start_time
        
        # Save to database
        generated_content = GeneratedContent.objects.create(
            user=request.user,
            content_type='video',
            prompt=f"Title: {title}, Description: {description}",
            result=content,
            processing_time=processing_time,
            success=True,
            metadata={'title': title, 'description': description}
        )
        
        return Response({
            'id': generated_content.id,
            'content': content,
            'title': title,
            'description': description,
            'processing_time': processing_time,
            'note': 'This is a video script generation. Actual video creation requires additional services.'
        })
    
    except Exception as e:
        processing_time = time.time() - start_time
        
        GeneratedContent.objects.create(
            user=request.user,
            content_type='video',
            prompt=f"Title: {title}, Description: {description}",
            processing_time=processing_time,
            success=False,
            error_message=str(e)
        )
        
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generation_history(request):
    """Get user's generation history"""
    content_type = request.GET.get('type', None)
    
    queryset = GeneratedContent.objects.filter(user=request.user)
    
    if content_type:
        queryset = queryset.filter(content_type=content_type)
    
    # Limit to last 50 items
    queryset = queryset[:50]
    
    serializer = GeneratedContentSerializer(queryset, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generation_stats(request):
    """Get user's generation statistics"""
    total_generations = GeneratedContent.objects.filter(user=request.user).count()
    successful_generations = GeneratedContent.objects.filter(user=request.user, success=True).count()
    
    stats_by_type = {}
    for content_type, _ in GeneratedContent.CONTENT_TYPES:
        count = GeneratedContent.objects.filter(user=request.user, content_type=content_type).count()
        stats_by_type[content_type] = count
    
    return Response({
        'total_generations': total_generations,
        'successful_generations': successful_generations,
        'success_rate': (successful_generations / total_generations * 100) if total_generations > 0 else 0,
        'by_type': stats_by_type
    })
