from django.urls import path
from . import views

urlpatterns = [
    path('', views.BlogListCreateView.as_view(), name='blog_list_create'),
    path('<slug:slug>/', views.BlogDetailView.as_view(), name='blog_detail'),
    path('<int:blog_id>/like/', views.like_blog, name='like_blog'),
    path('<int:blog_id>/bookmark/', views.bookmark_blog, name='bookmark_blog'),
    path('my-blogs/', views.my_blogs, name='my_blogs'),
    path('bookmarked/', views.bookmarked_blogs, name='bookmarked_blogs'),
    path('generate/', views.generate_blog_content, name='generate_blog_content'),
    path('generate-from-video/', views.generate_blog_from_video, name='generate_blog_from_video'),
    path('tags/', views.tags, name='tags'),
]
