import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, Bookmark, Eye, MessageCircle, Calendar, User, Tag, ArrowLeft, Edit, Trash2, Loader2 } from 'lucide-react';
import { useBlogContext } from '../contexts/BlogContext';
import { useAuth } from '../contexts/AuthContext';
import CommentList from '../components/CommentList';

const BlogDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    fetchBlog, 
    likeBlog, 
    bookmarkBlog, 
    deleteBlog, 
    isDarkMode, 
    loading, 
    error 
  } = useBlogContext();

  const [blog, setBlog] = useState(null);
  const [loadingBlog, setLoadingBlog] = useState(true);
  const [blogError, setBlogError] = useState(null);

  useEffect(() => {
    if (slug) {
      loadBlog();
    }
  }, [slug]);

  const loadBlog = async () => {
    setLoadingBlog(true);
    setBlogError(null);
    try {
      const blogData = await fetchBlog(slug);
      setBlog(blogData);
    } catch (err) {
      setBlogError('Failed to load blog post');
      console.error('Failed to fetch blog:', err);
    } finally {
      setLoadingBlog(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert('Please log in to like posts');
      return;
    }
    
    try {
      const response = await likeBlog(blog.id);
      setBlog(prev => ({
        ...prev,
        likes_count: response.likes_count,
        user_has_liked: response.liked
      }));
    } catch (error) {
      console.error('Failed to like blog:', error);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      alert('Please log in to bookmark posts');
      return;
    }
    
    try {
      const response = await bookmarkBlog(blog.id);
      setBlog(prev => ({
        ...prev,
        user_has_bookmarked: response.bookmarked
      }));
    } catch (error) {
      console.error('Failed to bookmark blog:', error);
    }
  };

  const handleEdit = () => {
    navigate(`/edit/${blog.slug}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this blog?')) {
      return;
    }

    try {
      await deleteBlog(blog.slug);
      navigate('/my-blogs');
    } catch (error) {
      console.error('Failed to delete blog:', error);
      alert('Failed to delete blog post');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isAuthor = user && blog && user.id === blog.author.id;

  if (loadingBlog) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <Loader2 className={`w-8 h-8 animate-spin ${isDarkMode ? 'text-white' : 'text-gray-900'}`} />
      </div>
    );
  }

  if (blogError || !blog) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className={`text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <h1 className="text-2xl font-bold mb-2">Blog Not Found</h1>
          <p className="text-lg opacity-75 mb-4">{blogError || 'The blog post you\'re looking for doesn\'t exist.'}</p>
          <Link 
            to="/"
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            to="/"
            className={`inline-flex items-center text-sm font-medium transition-colors duration-200 ${
              isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to blogs
          </Link>
        </div>

        {/* Blog Content */}
        <article className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border shadow-sm`}>
          {/* Featured Image */}
          {blog.featured_image && (
            <div className="w-full h-64 md:h-96 overflow-hidden rounded-t-lg">
              <img
                src={blog.featured_image}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            {/* Header */}
            <header className="mb-8">
              {/* Category */}
              {blog.category && (
                <div className="mb-4">
                  <span 
                    className="inline-block px-3 py-1 text-sm font-semibold rounded-full text-white"
                    style={{ backgroundColor: blog.category.color || '#3B82F6' }}
                  >
                    {blog.category.name}
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {blog.title}
              </h1>

              {/* Author and Date */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    {blog.author.profile?.avatar ? (
                      <img
                        src={blog.author.profile.avatar}
                        alt={blog.author.username}
                        className="w-10 h-10 rounded-full object-cover mr-3"
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                        isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                      }`}>
                        <User className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      </div>
                    )}
                    <div>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {blog.author.first_name} {blog.author.last_name} 
                        <span className={`ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          (@{blog.author.username})
                        </span>
                      </p>
                      <div className={`flex items-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(blog.created_at)}
                      </div>
                    </div>
                  </div>

                  {/* Author Actions */}
                  {isAuthor && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleEdit}
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                          isDarkMode 
                            ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                        title="Edit blog"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleDelete}
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                          isDarkMode 
                            ? 'text-red-400 hover:text-red-300 hover:bg-gray-700' 
                            : 'text-red-500 hover:text-red-600 hover:bg-gray-100'
                        }`}
                        title="Delete blog"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats and Actions */}
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-6 mb-8">
                <div className="flex items-center space-x-6 text-sm">
                  <div className={`flex items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Eye className="w-4 h-4 mr-1" />
                    <span>{blog.views_count}</span>
                  </div>
                  <div className={`flex items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <MessageCircle className="w-4 h-4 mr-1" />
                    <span>{blog.comments?.length || 0}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleLike}
                    className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                      blog.user_has_liked 
                        ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                        : (isDarkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        )
                    }`}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${blog.user_has_liked ? 'fill-current' : ''}`} />
                    <span>{blog.likes_count}</span>
                  </button>

                  <button
                    onClick={handleBookmark}
                    className={`p-2 rounded-full transition-colors duration-200 ${
                      blog.user_has_bookmarked 
                        ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                        : (isDarkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        )
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${blog.user_has_bookmarked ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            </header>

            {/* Content */}
            <div 
              className={`prose lg:prose-xl max-w-none ${
                isDarkMode ? 'prose-invert' : ''
              }`}
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                        isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Comments Section */}
        <div className="mt-8">
          <CommentList blogId={blog.id} />
        </div>
      </div>
    </div>
  );
};

export default BlogDetailPage;
