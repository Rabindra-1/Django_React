import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar, User, Tag, Hash } from 'lucide-react';
import { useBlogContext } from '../contexts/BlogContext';

const SearchFilters = ({ onFiltersChange, initialFilters = {} }) => {
  const { isDarkMode, categories, tags, fetchCategories, fetchTags } = useBlogContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    tags: [],
    author: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
    ...initialFilters
  });

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, [fetchCategories, fetchTags]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFiltersChange(filters);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [filters, onFiltersChange]);

  const handleInputChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTagToggle = (tagName) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tagName)
        ? prev.tags.filter(t => t !== tagName)
        : [...prev.tags, tagName]
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      tags: [],
      author: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  };

  const hasActiveFilters = filters.search || filters.category || filters.tags.length > 0 || 
                          filters.author || filters.dateFrom || filters.dateTo;

  const sortOptions = [
    { value: 'created_at', label: 'Date Created' },
    { value: 'updated_at', label: 'Last Updated' },
    { value: 'title', label: 'Title' },
    { value: 'views_count', label: 'Views' },
    { value: 'likes_count', label: 'Likes' }
  ];

  return (
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg`}>
      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder="Search blogs..."
            value={filters.search}
            onChange={(e) => handleInputChange('search', e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
          />
        </div>
      </div>

      {/* Filter Toggle */}
      <div className={`px-4 pb-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
            isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>Advanced Filters</span>
          {hasActiveFilters && (
            <span className="px-2 py-1 rounded-full bg-blue-500 text-white text-xs">
              {filters.tags.length + (filters.category ? 1 : 0) + (filters.author ? 1 : 0) + (filters.dateFrom || filters.dateTo ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Category and Author */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <Hash className="inline w-4 h-4 mr-1" />
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <User className="inline w-4 h-4 mr-1" />
                Author
              </label>
              <input
                type="text"
                placeholder="Author username"
                value={filters.author}
                onChange={(e) => handleInputChange('author', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <Calendar className="inline w-4 h-4 mr-1" />
              Date Range
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="date"
                placeholder="From date"
                value={filters.dateFrom}
                onChange={(e) => handleInputChange('dateFrom', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
              <input
                type="date"
                placeholder="To date"
                value={filters.dateTo}
                onChange={(e) => handleInputChange('dateTo', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <Tag className="inline w-4 h-4 mr-1" />
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagToggle(tag.name)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filters.tags.includes(tag.name)
                        ? 'bg-blue-500 text-white'
                        : isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sort Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleInputChange('sortBy', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Sort Order
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleInputChange('sortOrder', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="flex justify-end pt-4">
              <button
                onClick={clearFilters}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDarkMode 
                    ? 'text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600' 
                    : 'text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <X className="w-4 h-4" />
                <span>Clear Filters</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
