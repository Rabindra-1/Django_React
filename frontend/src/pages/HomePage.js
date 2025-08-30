import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBlogContext } from '../contexts/BlogContext';
import { blogAPI } from '../services/api';
import SearchFilters from '../components/SearchFilters';
import BlogList from '../components/BlogList';
import { Wand2, PenLine } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDarkMode, fetchBlogs, likePost, bookmarkPost } = useBlogContext();
  
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    tags: [],
    author: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  useEffect(() => {
    loadBlogs();
  }, [filters, currentPage]);

  const loadBlogs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Convert filters to API params
      const params = {
        page: currentPage,
        ordering: `${filters.sortOrder === 'desc' ? '-' : ''}${filters.sortBy}`,
        ...(filters.search && { search: filters.search }),
        ...(filters.category && { category: filters.category }),
        ...(filters.tags.length > 0 && { tags: filters.tags.join(',') }),
        ...(filters.author && { author: filters.author }),
        ...(filters.dateFrom && { created_at__gte: filters.dateFrom }),
        ...(filters.dateTo && { created_at__lte: filters.dateTo }),
      };

      const response = await blogAPI.getAllBlogs(params);
      setBlogs(response.data.results || response.data);
      
      if (response.data.count) {
        setTotalPages(Math.ceil(response.data.count / 12));
      }
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
      setError('Failed to load blogs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (blogId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const response = await likePost(blogId);
      setBlogs(prev => prev.map(blog => 
        blog.id === blogId 
          ? { 
              ...blog, 
              is_liked: response.liked,
              likes_count: response.likes_count 
            }
          : blog
      ));
    } catch (error) {
      console.error('Failed to like blog:', error);
    }
  };

  const handleBookmark = async (blogId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const response = await bookmarkPost(blogId);
      setBlogs(prev => prev.map(blog => 
        blog.id === blogId 
          ? { ...blog, is_bookmarked: response.bookmarked }
          : blog
      ));
    } catch (error) {
      console.error('Failed to bookmark blog:', error);
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Discover Amazing Blogs
          </h1>
          <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Explore a world of knowledge, stories, and insights from our community
          </p>
          
          {user && (
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a 
                href="/create" 
                className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <PenLine className="w-5 h-5 mr-2" />
                Write a Blog
              </a>
              <a 
                href="/ai-generator" 
                className="inline-flex items-center px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
              >
                <Wand2 className="w-5 h-5 mr-2" />
                AI Generator
              </a>
            </div>
          )}
        </div>

        {/* Search Filters */}
        <div className="mb-8">
          <SearchFilters 
            onFiltersChange={handleFiltersChange} 
            initialFilters={filters}
          />
        </div>

        {/* Blog List */}
        {error ? (
          <div className={`text-center py-12 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
            <p>{error}</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-12">
            <h3 className={`text-xl font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              No blogs found
            </h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <BlogList 
            blogs={blogs} 
            onLike={handleLike} 
            onBookmark={handleBookmark} 
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-md ${isDarkMode ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-white text-gray-700 border-gray-300'} border ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`w-10 h-10 rounded-md ${currentPage === i + 1 ? 'bg-blue-600 text-white' : isDarkMode ? 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'} border`}
                >
                  {i + 1}
                </button>
              )).slice(
                Math.max(0, currentPage - 3),
                Math.min(totalPages, currentPage + 2)
              )}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md ${isDarkMode ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-white text-gray-700 border-gray-300'} border ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
