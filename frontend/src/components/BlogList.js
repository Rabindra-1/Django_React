import React, { useEffect, useState } from 'react';
import { Search, Filter, Grid, List, Loader2 } from 'lucide-react';
import BlogCard from './BlogCard';
import { useBlogContext } from '../contexts/BlogContext';
import { useAuth } from '../contexts/AuthContext';

const BlogList = ({ onBlogClick }) => {
  const { 
    blogs, 
    loading, 
    error, 
    fetchBlogs, 
    fetchCategories, 
    fetchTags,
    categories,
    tags,
    isDarkMode 
  } = useBlogContext();
  
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('-created_at');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, [searchTerm, selectedCategory, selectedTag, sortBy]);

  const loadData = async () => {
    try {
      // Load categories and tags on first load
      if (categories.length === 0) await fetchCategories();
      if (tags.length === 0) await fetchTags();

      // Build query parameters
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedTag) params.tags__name = selectedTag;
      if (sortBy) params.ordering = sortBy;

      await fetchBlogs(params);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? '' : categoryId);
  };

  const handleTagChange = (tagName) => {
    setSelectedTag(tagName === selectedTag ? '' : tagName);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedTag('');
    setSortBy('-created_at');
  };

  if (error) {
    return (
      <div className={`text-center py-12 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
        <p className="text-lg mb-4">Error loading blogs</p>
        <p className="text-sm">{error}</p>
        <button 
          onClick={loadData}
          className={`
            mt-4 px-4 py-2 rounded-lg transition-colors duration-200
            ${isDarkMode 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
            }
          `}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Controls */}
      <div className="flex flex-col space-y-4">
        {/* Search and View Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className={`absolute left-3 top-3 w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchTerm}
                onChange={handleSearchChange}
                className={`
                  w-full pl-10 pr-4 py-2 rounded-lg border transition-colors duration-200
                  ${isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20
                `}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`
                flex items-center px-3 py-2 rounded-lg border transition-colors duration-200
                ${showFilters 
                  ? (isDarkMode ? 'bg-blue-600 border-blue-600 text-white' : 'bg-blue-500 border-blue-500 text-white')
                  : (isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50')
                }
              `}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>

            {/* View Mode Toggle */}
            <div className={`flex border rounded-lg ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
              <button
                onClick={() => setViewMode('grid')}
                className={`
                  p-2 transition-colors duration-200
                  ${viewMode === 'grid' 
                    ? (isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900')
                    : (isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900')
                  }
                `}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`
                  p-2 border-l transition-colors duration-200
                  ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}
                  ${viewMode === 'list' 
                    ? (isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900')
                    : (isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900')
                  }
                `}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className={`
            p-4 rounded-lg border
            ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}
          `}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Category
                </label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedCategory === category.id.toString()}
                        onChange={() => handleCategoryChange(category.id.toString())}
                        className="mr-2"
                      />
                      <span 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {category.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tag Filter */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tags
                </label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {tags.map((tag) => (
                    <label key={tag.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedTag === tag.name}
                        onChange={() => handleTagChange(tag.name)}
                        className="mr-2"
                      />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {tag.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort Filter */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`
                    w-full p-2 rounded-lg border
                    ${isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                    }
                  `}
                >
                  <option value="-created_at">Latest</option>
                  <option value="created_at">Oldest</option>
                  <option value="-likes_count">Most Liked</option>
                  <option value="-views_count">Most Viewed</option>
                  <option value="title">Title A-Z</option>
                  <option value="-title">Title Z-A</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={clearFilters}
                className={`
                  px-4 py-2 text-sm rounded-lg transition-colors duration-200
                  ${isDarkMode 
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className={`w-8 h-8 animate-spin ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
        </div>
      )}

      {/* Empty State */}
      {!loading && blogs.length === 0 && (
        <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <p className="text-lg mb-2">No blogs found</p>
          <p className="text-sm">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Blog Grid/List */}
      {!loading && blogs.length > 0 && (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {blogs.map((blog) => (
            <BlogCard 
              key={blog.id} 
              blog={blog} 
              onClick={onBlogClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogList;
