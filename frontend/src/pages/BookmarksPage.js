import React, { useEffect, useState } from 'react';
import { Bookmark, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBlogContext } from '../contexts/BlogContext';
import { blogAPI } from '../services/api';
import BlogList from '../components/BlogList';

const BookmarksPage = () => {
  const { user } = useAuth();
  const { isDarkMode } = useBlogContext();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadBookmarkedBlogs();
    }
  }, [user]);

  const loadBookmarkedBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await blogAPI.getBookmarkedBlogs();
      setBlogs(response.data);
    } catch (err) {
      setError('Failed to load bookmarked blogs');
      console.error('Failed to load bookmarked blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlogClick = (blog) => {
    window.location.href = `/blog/${blog.slug}`;
  };

  if (!user) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className={`text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <Bookmark className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
          <p className="text-lg opacity-75">Please log in to view your bookmarks.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Bookmark className="w-8 h-8 mr-3" />
            My Bookmarks
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Your saved blog posts for later reading
          </p>
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
              onClick={loadBookmarkedBlogs}
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
            <Bookmark className="w-24 h-24 mx-auto mb-6 opacity-50" />
            <h2 className="text-2xl font-bold mb-4">No bookmarks yet</h2>
            <p className="text-lg">Start bookmarking posts you want to read later!</p>
          </div>
        )}

        {/* Bookmarked Blogs */}
        {!loading && !error && blogs.length > 0 && (
          <div className="space-y-6">
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {blogs.length} bookmarked {blogs.length === 1 ? 'post' : 'posts'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <div key={blog.id} className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-6 cursor-pointer hover:shadow-md transition-all duration-200`} onClick={() => handleBlogClick(blog)}>
                  {blog.featured_image && (
                    <img src={blog.featured_image} alt={blog.title} className="w-full h-32 object-cover rounded-lg mb-4" />
                  )}
                  <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {blog.title}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                    By {blog.author.first_name} {blog.author.last_name}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date(blog.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarksPage;
