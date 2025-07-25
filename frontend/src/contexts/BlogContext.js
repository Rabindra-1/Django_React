import React, { createContext, useContext, useState } from 'react';

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
  // Navigation state
  const [currentPage, setCurrentPage] = useState('home');
  const [currentSubPage, setCurrentSubPage] = useState('text');
  
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
    category: 'tech'
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
  
  // Utility functions
  const handlePostClick = (post) => {
    setSelectedPost(post);
    setCurrentPage('post-detail');
  };
  
  const resetForm = () => {
    setBlogForm({ title: '', content: '', category: 'tech' });
  };
  
  const value = {
    currentPage,
    setCurrentPage,
    currentSubPage,
    setCurrentSubPage,
    selectedPost,
    setSelectedPost,
    expandedPost,
    setExpandedPost,
    isDarkMode,
    setIsDarkMode,
    toggleTheme,
    blogForm,
    setBlogForm,
    handlePostClick,
    resetForm
  };
  
  return (
    <BlogContext.Provider value={value}>
      {children}
    </BlogContext.Provider>
  );
};
