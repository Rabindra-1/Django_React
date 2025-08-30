import React from 'react';
import { Heart, Bookmark, Eye, MessageCircle, Calendar, User, Tag } from 'lucide-react';
import { useBlogContext } from '../contexts/BlogContext';

const BlogCard = ({ blog, onClick }) => {
  const { likeBlog, bookmarkBlog, isDarkMode } = useBlogContext();

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      await likeBlog(blog.id);
    } catch (error) {
      console.error('Failed to like blog:', error);
    }
  };

  const handleBookmark = async (e) => {
    e.stopPropagation();
    try {
      await bookmarkBlog(blog.id);
    } catch (error) {
      console.error('Failed to bookmark blog:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substr(0, maxLength) + '...';
  };

  return (
    <div 
      className={`
        ${isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'} 
        border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} 
        rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer
      `}
      onClick={() => onClick(blog)}
    >
      {/* Featured Image */}
      {blog.featured_image && (
        <div className="w-full h-48 overflow-hidden rounded-t-lg">
          <img
            src={blog.featured_image}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6">
        {/* Category Badge */}
        {blog.category && (
          <span 
            className="inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3"
            style={{ 
              backgroundColor: blog.category.color || '#3B82F6',
              color: 'white'
            }}
          >
            {blog.category.name}
          </span>
        )}

        {/* Title */}
        <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {blog.title}
        </h3>

        {/* Content Preview */}
        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
          {truncateContent(blog.content.replace(/<[^>]*>/g, ''))}
        </p>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {blog.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className={`
                    inline-flex items-center px-2 py-1 text-xs rounded-md
                    ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}
                  `}
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag.name}
                </span>
              ))}
              {blog.tags.length > 3 && (
                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  +{blog.tags.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Author and Date */}
        <div className={`flex items-center justify-between mb-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              <span>{blog.author.first_name} {blog.author.last_name} (@{blog.author.username})</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{formatDate(blog.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Stats and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm">
            <div className={`flex items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <Eye className="w-4 h-4 mr-1" />
              <span>{blog.views_count}</span>
            </div>
            <div className={`flex items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <MessageCircle className="w-4 h-4 mr-1" />
              <span>{blog.comments_count || 0}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleLike}
              className={`
                flex items-center px-3 py-1 rounded-full text-sm transition-colors duration-200
                ${blog.user_has_liked 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : `${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`
                }
              `}
            >
              <Heart 
                className={`w-4 h-4 mr-1 ${blog.user_has_liked ? 'fill-current' : ''}`}
              />
              <span>{blog.likes_count}</span>
            </button>

            <button
              onClick={handleBookmark}
              className={`
                p-2 rounded-full transition-colors duration-200
                ${blog.user_has_bookmarked 
                  ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                  : `${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`
                }
              `}
            >
              <Bookmark 
                className={`w-4 h-4 ${blog.user_has_bookmarked ? 'fill-current' : ''}`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
