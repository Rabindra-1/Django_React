from django.db import models
from django.contrib.auth.models import User

class GeneratedContent(models.Model):
    CONTENT_TYPES = [
        ('text', 'Text'),
        ('image', 'Image'),
        ('video', 'Video'),
        ('youtube', 'YouTube Processing'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='generated_content')
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPES)
    prompt = models.TextField()
    result = models.TextField(blank=True)
    file_path = models.CharField(max_length=500, blank=True)  # For images/videos
    metadata = models.JSONField(default=dict, blank=True)  # Additional data
    created_at = models.DateTimeField(auto_now_add=True)
    processing_time = models.FloatField(null=True, blank=True)  # In seconds
    success = models.BooleanField(default=True)
    error_message = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.content_type} - {self.created_at}"

class ImageGeneration(models.Model):
    STYLE_CHOICES = [
        ('realistic', 'Realistic'),
        ('artistic', 'Artistic'),
        ('cartoon', 'Cartoon'),
        ('abstract', 'Abstract'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='generated_images')
    prompt = models.TextField()
    style = models.CharField(max_length=20, choices=STYLE_CHOICES, default='realistic')
    image_url = models.URLField(blank=True)
    local_path = models.CharField(max_length=500, blank=True)
    width = models.PositiveIntegerField(default=1024)
    height = models.PositiveIntegerField(default=1024)
    created_at = models.DateTimeField(auto_now_add=True)
    success = models.BooleanField(default=True)
    error_message = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Image by {self.user.username} - {self.prompt[:50]}"
