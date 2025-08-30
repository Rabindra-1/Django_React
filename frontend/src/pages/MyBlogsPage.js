import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, Edit, Trash2, Eye, Heart, MessageCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBlogContext } from '../contexts/BlogContext';
import { blogAPI } from '../services/api';

const MyBlogsPage = () => {
  const { user } = useAuth();
  const { isDarkMode, deleteBlog } = useBlogContext();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadMyBlogs();
    }
  }, [user]);

  const loadMyBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await blogAPI.getMyBlogs();
      setBlogs(response.data);
    } catch (err) {
      setError('Failed to load your blogs');
      console.error('Failed to load my blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;

    try {
      await deleteBlog(slug);
      setBlogs(prev => prev.filter(blog => blog.slug !== slug));
    } catch (error) {
      console.error('Failed to delete blog:', error);
      alert('Failed to delete blog post');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className={`text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
          <p className="text-lg opacity-75">Please log in to view your blogs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              My Blogs
            </h1>
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Manage and edit your blog posts
            </p>
          </div>
          
          <Link
            to="/create"
            className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
              isDarkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Blog
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className={`w-8 h-8 animate-spin ${isDarkMode ? 'text-white' : 'text-gray-900'}`} />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className={`text-center py-12 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
            <p className="text-lg mb-4">{error}</p>
            <button 
              onClick={loadMyBlogs}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && blogs.length === 0 && (
          <div className={`text-center py-16 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <BookOpen className="w-24 h-24 mx-auto mb-6 opacity-50" />
            <h2 className="text-2xl font-bold mb-4">No blogs yet</h2>
            <p className="text-lg mb-6">Start writing your first blog post to share your thoughts with the world.</p>
            <Link
              to="/create"
              className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Blog
            </Link>
          </div>
        )}

        {/* Blogs Grid */}
        {!loading && !error && blogs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <div
                key={blog.id}
                className={`${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                } border rounded-lg shadow-sm hover:shadow-md transition-all duration-200`}
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
                  {/* Category */}
                  {blog.category && (
                    <span 
                      className="inline-block px-2 py-1 text-xs font-semibold rounded-full text-white mb-3"
                      style={{ backgroundColor: blog.category.color || '#3B82F6' }}
                    >
                      {blog.category.name}
                    </span>
                  )}

                  {/* Title */}
                  <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Link 
                      to={`/blog/${blog.slug}`}
                      className="hover:text-blue-500 transition-colors duration-200"
                    >
                      {blog.title}
                    </Link>
                  </h3>

                  {/* Content Preview */}
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
                    {blog.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                  </p>

                  {/* Stats */}
                  <div className={`flex items-center justify-between text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        <span>{blog.views_count}</span>
                      </div>
                      <div className="flex items-center">
                        <Heart className="w-4 h-4 mr-1" />
                        <span>{blog.likes_count}</span>
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        <span>{blog.comments_count || 0}</span>
                      </div>
                    </div>
                    <span>{formatDate(blog.created_at)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/edit/${blog.slug}`}
                        className={`flex items-center px-3 py-1 rounded text-sm font-medium transition-colors duration-200 ${
                          isDarkMode 
                            ? 'bg-blue-900 text-blue-300 hover:bg-blue-800' 
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        }`}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Link>
                      
                      <button
                        onClick={() => handleDelete(blog.slug)}
                        className={`flex items-center px-3 py-1 rounded text-sm font-medium transition-colors duration-200 ${
                          isDarkMode 
                            ? 'bg-red-900 text-red-300 hover:bg-red-800' 
                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </button>
                    </div>

                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      blog.is_published 
                        ? (isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800')
                        : (isDarkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800')
                    }`}>
                      {blog.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBlogsPage;
