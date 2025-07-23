from django.contrib import admin
from .models import Blog, Tag, BlogImage, BlogLike, BlogBookmark

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']

class BlogImageInline(admin.TabularInline):
    model = BlogImage
    extra = 1

@admin.register(Blog)
class BlogAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'layout_type', 'is_published', 'created_at', 'likes_count', 'views_count']
    list_filter = ['layout_type', 'is_published', 'created_at', 'tags']
    search_fields = ['title', 'content', 'author__username']
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ['tags']
    inlines = [BlogImageInline]

@admin.register(BlogLike)
class BlogLikeAdmin(admin.ModelAdmin):
    list_display = ['blog', 'user', 'created_at']
    list_filter = ['created_at']

@admin.register(BlogBookmark)
class BlogBookmarkAdmin(admin.ModelAdmin):
    list_display = ['blog', 'user', 'created_at']
    list_filter = ['created_at']
