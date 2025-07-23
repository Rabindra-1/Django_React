from rest_framework import serializers
from .models import Comment
from accounts.serializers import UserSerializer

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    replies_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = [
            'id', 'blog', 'author', 'content', 'parent', 'created_at', 
            'updated_at', 'replies', 'replies_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_replies(self, obj):
        if obj.parent is None:  # Only get replies for top-level comments
            replies = obj.replies.filter(is_active=True)
            return CommentSerializer(replies, many=True, context=self.context).data
        return []
    
    def get_replies_count(self, obj):
        return obj.replies.filter(is_active=True).count()

class CommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['blog', 'content', 'parent']
    
    def validate_parent(self, value):
        if value:
            # Ensure parent comment belongs to the same blog
            if value.blog != self.initial_data.get('blog'):
                raise serializers.ValidationError("Parent comment must belong to the same blog.")
            # Prevent nested replies (only one level of nesting)
            if value.parent is not None:
                raise serializers.ValidationError("Cannot reply to a reply. Please reply to the parent comment.")
        return value
