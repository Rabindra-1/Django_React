import React, { createContext, useContext, useState, useCallback } from 'react';
import { blogAPI } from '../services/api';
import { useAuth } from './AuthContext';

const BlogContext = createContext(undefined);

/**
 * Hook to use the BlogContext
 * @returns {Object} Blog context state and functions
 */
export const useBlogContext = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlogContext must be used within a BlogProvider');
  }
  return context;
};

/**
 * Blog context provider component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.Component} BlogProvider component
 */
export const BlogProvider = ({ children }) => {
  // const { user } = useAuth(); // Available if needed
  
  // Navigation state
  const [currentPage, setCurrentPage] = useState('home');
  const [currentSubPage, setCurrentSubPage] = useState('text');
  
  // Data state
  const [blogs, setBlogs] = useState([]);
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Post state
  const [selectedPost, setSelectedPost] = useState(null);
  const [expandedPost, setExpandedPost] = useState(null);
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    } else {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  });
  
  // Form state
  const [blogForm, setBlogForm] = useState({
    title: '',
    content: '',
    category: '',
    tags: [],
    layout_type: 'minimal',
    featured_image: null
  });
  
  // Theme management
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  // Initialize theme on mount
  React.useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  // API functions
  const fetchBlogs = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await blogAPI.getBlogs(params);
      setBlogs(response.data.results || response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch blogs');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBlog = useCallback(async (slug) => {
    setLoading(true);
    setError(null);
    try {
      const response = await blogAPI.getBlog(slug);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch blog');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createBlog = useCallback(async (blogData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await blogAPI.createBlog(blogData);
      setBlogs(prev => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create blog');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBlog = useCallback(async (slug, blogData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await blogAPI.updateBlog(slug, blogData);
      setBlogs(prev => prev.map(blog => blog.slug === slug ? response.data : blog));
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update blog');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBlog = useCallback(async (slug) => {
    setLoading(true);
    setError(null);
    try {
      await blogAPI.deleteBlog(slug);
      setBlogs(prev => prev.filter(blog => blog.slug !== slug));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete blog');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const likeBlog = useCallback(async (blogId) => {
    try {
      const response = await blogAPI.likeBlog(blogId);
      setBlogs(prev => prev.map(blog => 
        blog.id === blogId ? { 
          ...blog, 
          likes_count: response.data.likes_count,
          user_has_liked: response.data.liked 
        } : blog
      ));
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to like blog');
      throw err;
    }
  }, []);

  const bookmarkBlog = useCallback(async (blogId) => {
    try {
      const response = await blogAPI.bookmarkBlog(blogId);
      setBlogs(prev => prev.map(blog => 
        blog.id === blogId ? { 
          ...blog, 
          user_has_bookmarked: response.data.bookmarked 
        } : blog
      ));
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to bookmark blog');
      throw err;
    }
  }, []);

  const fetchTags = useCallback(async () => {
    try {
      const response = await blogAPI.getTags();
      setTags(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tags');
      throw err;
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await blogAPI.getCategories();
      setCategories(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch categories');
      throw err;
    }
  }, []);

  const generateBlogContent = useCallback(async (prompt) => {
    setLoading(true);
    try {
      const response = await blogAPI.generateBlogContent(prompt);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate content');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Utility functions
  const handlePostClick = (post) => {
    setSelectedPost(post);
    setCurrentPage('post-detail');
  };
  
  const resetForm = () => {
    setBlogForm({ 
      title: '', 
      content: '', 
      category: '',
      tags: [],
      layout_type: 'minimal',
      featured_image: null
    });
  };
  
  const value = {
    // Navigation state
    currentPage,
    setCurrentPage,
    currentSubPage,
    setCurrentSubPage,
    
    // Data state
    blogs,
    setBlogs,
    tags,
    categories,
    loading,
    error,
    setError,
    
    // Post state
    selectedPost,
    setSelectedPost,
    expandedPost,
    setExpandedPost,
    
    // Theme state
    isDarkMode,
    setIsDarkMode,
    toggleTheme,
    
    // Form state
    blogForm,
    setBlogForm,
    
    // API functions
    fetchBlogs,
    fetchBlog,
    createBlog,
    updateBlog,
    deleteBlog,
    likeBlog,
    bookmarkBlog,
    likePost: likeBlog, // Alias for compatibility
    bookmarkPost: bookmarkBlog, // Alias for compatibility
    fetchTags,
    fetchCategories,
    generateBlogContent,
    
    // Utility functions
    handlePostClick,
    resetForm
  };
  
  return (
    <BlogContext.Provider value={value}>
      {children}
    </BlogContext.Provider>
  );
};
