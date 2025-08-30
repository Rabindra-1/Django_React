import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBlogContext } from '../contexts/BlogContext';
import BlogForm from '../components/BlogForm';

const CreateBlogPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchBlog, isDarkMode } = useBlogContext();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEditing = Boolean(slug);

  useEffect(() => {
    if (isEditing && slug) {
      loadBlog();
    }
  }, [slug, isEditing]);

  const loadBlog = async () => {
    setLoading(true);
    setError(null);
    try {
      const blogData = await fetchBlog(slug);
      
      // Check if user is the author
      if (user.id !== blogData.author.id) {
        navigate('/');
        return;
      }
      
      setBlog(blogData);
    } catch (err) {
      setError('Failed to load blog for editing');
      console.error('Failed to fetch blog:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (savedBlog) => {
    navigate(`/blog/${savedBlog.slug}`);
  };

  const handleCancel = () => {
    if (isEditing && blog) {
      navigate(`/blog/${blog.slug}`);
    } else {
      navigate('/');
    }
  };

  // Redirect if not logged in
  if (!user) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className={`text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
          <p className="text-lg opacity-75">Please log in to create or edit blog posts.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className={`text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p className="text-lg opacity-75 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className={`mt-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BlogForm 
      blog={blog} 
      onSave={handleSave} 
      onCancel={handleCancel} 
    />
  );
};

export default CreateBlogPage;
