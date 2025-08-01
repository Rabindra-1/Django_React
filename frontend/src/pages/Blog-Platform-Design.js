// Blog Platform Design - Main Component
// This component now uses the comprehensive background infrastructure

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useBlogContext } from '../contexts/BlogContext.js';
import { useBlog } from '../hooks/useBlog.js';
import { useAIGeneration } from '../hooks/useAIGeneration.js';
import { useAuth } from '../contexts/AuthContext';
import { formatDate, getCategoryColor, getCategoryColorDark } from '../utils/helpers.js';
import { BLOG_CATEGORIES, PAGES, GENERATION_TYPES, SUCCESS_MESSAGES } from '../constants/index.js';
import VideoToBlogConverter from '../components/VideoToBlogConverter.js';
import ImageToBlogConverter from '../components/ImageToBlogConverter.js';

const App = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const pageFromUrl = searchParams.get('page') || 'home';
  
  // Use context and hooks for state management
  const {
    currentPage,
    setCurrentPage,
    currentSubPage,
    setCurrentSubPage,
    selectedPost,
    setSelectedPost,
    expandedPost,
    setExpandedPost,
    isDarkMode,
    toggleTheme,
    blogForm,
    setBlogForm,
    handlePostClick,
    resetForm
  } = useBlogContext();
  
  const { posts, loading, error, createPost, likePost } = useBlog();
  const { generateText, generateImage, processYouTubeLink, generateVideo, loading: aiLoading } = useAIGeneration();
  const { user } = useAuth();
  
  // Update current page based on URL params
  React.useEffect(() => {
    setCurrentPage(pageFromUrl);
  }, [pageFromUrl, setCurrentPage]);

  // Enhanced form submission with API integration
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!user) {
      alert('Please log in to create a blog post');
      return;
    }
    
    // Validate form data
    if (!blogForm.title || !blogForm.content) {
      alert('Please fill in both title and content');
      return;
    }
    
    console.log('Submitting blog data:', {
      title: blogForm.title,
      content: blogForm.content,
      category: blogForm.category,
      user: user.username
    });
    
    // Prepare the blog data with all required fields
    const blogData = {
      title: blogForm.title,
      content: blogForm.content,
      category: blogForm.category,
      layout_type: 'minimal', // Valid layout type from Blog model
      is_published: true, // Set to published when submitting
      tags: [] // Empty tags array for now
    };
    
    const result = await createPost(blogData);
    
    console.log('Blog creation result:', result);
    
    if (result.success) {
      resetForm();
      alert('Blog post created successfully! You can view it on the Home page.');
      // Navigate to home page to see the new post
      setCurrentPage('home');
    } else {
      console.error('Blog creation failed:', result.error);
      alert(`Failed to create post: ${result.error}`);
    }
  };

  // Use posts from the hook instead of static data
  const blogPosts = posts.length > 0 ? posts : [];

  // Show loading state
  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className={`text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <i className="fas fa-spinner fa-spin text-4xl mb-4"></i>
          <p>Loading blog posts...</p>
        </div>
      </div>
    );
  }


  const renderHomePage = () => (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Latest Blog Posts
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Discover insightful articles from our community of writers
          </p>
        </div>

        <div className="space-y-6">
          {blogPosts.map((post) => (
            <div
              key={post.id}
              className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6 transition-all duration-300 hover:shadow-lg cursor-pointer`}
              onClick={() => handlePostClick(post)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'} hover:text-blue-600 transition-colors duration-200`}>
                    {post.title}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      By {typeof post.author === 'object' ? post.author?.username || post.author?.email || 'Unknown Author' : post.author}
                    </span>
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {post.date || (post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Unknown Date')}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {typeof post.category === 'object' ? post.category?.name || 'Uncategorized' : post.category}
                    </span>
                  </div>
                </div>
              </div>
              
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4 leading-relaxed`}>
                {expandedPost === post.id ? post.fullContent : post.shortContent}
              </p>
              
              <div className="flex items-center justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedPost(expandedPost === post.id ? null : post.id);
                  }}
                  className={`text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 cursor-pointer whitespace-nowrap !rounded-button ${
                    isDarkMode ? 'text-blue-400 hover:text-blue-300' : ''
                  }`}
                >
                  {expandedPost === post.id ? 'Read Less' : 'Read More'}
                </button>
                
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center space-x-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <i className="fas fa-heart"></i>
                    <span>{post.likes}</span>
                  </div>
                  <div className={`flex items-center space-x-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <i className="fas fa-comment"></i>
                    <span>{post.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPostDetail = () => (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => setCurrentPage('home')}
          className={`mb-6 flex items-center space-x-2 ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} transition-colors duration-200 cursor-pointer whitespace-nowrap !rounded-button`}
        >
          <i className="fas fa-arrow-left"></i>
          <span>Back to Posts</span>
        </button>

        {selectedPost && (
          <article className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-8 transition-colors duration-300`}>
            <header className="mb-6">
              <h1 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedPost.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm">
                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  By {typeof selectedPost.author === 'object' ? selectedPost.author?.username || selectedPost.author?.email || 'Unknown Author' : selectedPost.author}
                </span>
                <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {selectedPost.date || (selectedPost.created_at ? new Date(selectedPost.created_at).toLocaleDateString() : 'Unknown Date')}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
                }`}>
                  {typeof selectedPost.category === 'object' ? selectedPost.category?.name || 'Uncategorized' : selectedPost.category}
                </span>
              </div>
            </header>

            <div className={`prose max-w-none mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p className="text-lg leading-relaxed">{selectedPost.fullContent}</p>
            </div>

            <div className="flex items-center justify-between border-t pt-6">
              <div className="flex items-center space-x-6">
                <button className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 cursor-pointer whitespace-nowrap !rounded-button ${
                  isDarkMode ? 'bg-red-900 text-red-300 hover:bg-red-800' : 'bg-red-50 text-red-600 hover:bg-red-100'
                }`}>
                  <i className="fas fa-heart"></i>
                  <span>Like ({selectedPost.likes})</span>
                </button>
                <button className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 cursor-pointer whitespace-nowrap !rounded-button ${
                  isDarkMode ? 'bg-blue-900 text-blue-300 hover:bg-blue-800' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}>
                  <i className="fas fa-comment"></i>
                  <span>Comment ({selectedPost.comments})</span>
                </button>
              </div>
              <button className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 cursor-pointer whitespace-nowrap !rounded-button ${
                isDarkMode ? 'bg-green-900 text-green-300 hover:bg-green-800' : 'bg-green-50 text-green-600 hover:bg-green-100'
              }`}>
                <i className="fas fa-share"></i>
                <span>Share</span>
              </button>
            </div>
          </article>
        )}
      </div>
    </div>
  );

  const renderWritePage = () => (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Write a New Blog Post
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Share your thoughts and ideas with the community
          </p>
        </div>

        <form onSubmit={handleFormSubmit} className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-8 transition-colors duration-300`}>
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Blog Title
            </label>
            <input
              type="text"
              value={blogForm.title}
              onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 text-sm ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
              placeholder="Enter your blog title..."
              required
            />
          </div>

          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Category
            </label>
            <div className="relative">
              <select
                value={blogForm.category}
                onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 text-sm cursor-pointer appearance-none ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
              >
                <option value="tech">Technology</option>
                <option value="sports">Sports</option>
                <option value="education">Education</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="business">Business</option>
                <option value="health">Health</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <i className={`fas fa-chevron-down ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}></i>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Blog Content
            </label>
            <textarea
              value={blogForm.content}
              onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
              rows={12}
              className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 text-sm resize-none ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
              placeholder="Write your blog content here..."
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 cursor-pointer whitespace-nowrap !rounded-button"
            >
              Publish Blog Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderGenerateSubNav = () => (
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'} border-b transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          <button
            onClick={() => setCurrentSubPage('text')}
            className={`px-4 py-3 text-sm font-medium transition-colors duration-200 cursor-pointer whitespace-nowrap !rounded-button ${
              currentSubPage === 'text'
                ? isDarkMode ? 'text-blue-400 border-b-2 border-blue-400' : 'text-blue-600 border-b-2 border-blue-600'
                : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            TEXT
          </button>
          <button
            onClick={() => setCurrentSubPage('youtube')}
            className={`px-4 py-3 text-sm font-medium transition-colors duration-200 cursor-pointer whitespace-nowrap !rounded-button ${
              currentSubPage === 'youtube'
                ? isDarkMode ? 'text-blue-400 border-b-2 border-blue-400' : 'text-blue-600 border-b-2 border-blue-600'
                : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            YOUTUBE LINKS
          </button>
          <button
            onClick={() => setCurrentSubPage('video')}
            className={`px-4 py-3 text-sm font-medium transition-colors duration-200 cursor-pointer whitespace-nowrap !rounded-button ${
              currentSubPage === 'video'
                ? isDarkMode ? 'text-blue-400 border-b-2 border-blue-400' : 'text-blue-600 border-b-2 border-blue-600'
                : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            VIDEO
          </button>
          <button
            onClick={() => setCurrentSubPage('image')}
            className={`px-4 py-3 text-sm font-medium transition-colors duration-200 cursor-pointer whitespace-nowrap !rounded-button ${
              currentSubPage === 'image'
                ? isDarkMode ? 'text-blue-400 border-b-2 border-blue-400' : 'text-blue-600 border-b-2 border-blue-600'
                : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            IMAGE
          </button>
        </div>
      </div>
    </div>
  );

  const renderGeneratePage = () => (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      {renderGenerateSubNav()}
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {currentSubPage === 'text' && (
          <div>
            <h1 className={`text-4xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              AI Text Generator
            </h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6 transition-colors duration-300`}>
                <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Generate Content
                </h3>
                <textarea
                  placeholder="Enter your prompt here..."
                  className={`w-full h-32 px-4 py-3 rounded-lg border transition-colors duration-200 text-sm resize-none ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 cursor-pointer whitespace-nowrap !rounded-button">
                  Generate Text
                </button>
              </div>
              <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6 transition-colors duration-300`}>
                <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Generated Output
                </h3>
                <div className={`h-32 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Your generated text will appear here...
                </div>
              </div>
            </div>
          </div>
        )}

        {currentSubPage === 'youtube' && (
          <div>
            <h1 className={`text-4xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              YouTube Link Processor
            </h1>
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6 transition-colors duration-300`}>
              <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Extract Content from YouTube
              </h3>
              <input
                type="url"
                placeholder="Paste YouTube URL here..."
                className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 text-sm ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <button className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 cursor-pointer whitespace-nowrap !rounded-button">
                <i className="fab fa-youtube mr-2"></i>
                Process Video
              </button>
            </div>
          </div>
        )}

        {currentSubPage === 'video' && (
          <VideoToBlogConverter isDarkMode={isDarkMode} />
        )}

        {currentSubPage === 'image' && (
          <ImageToBlogConverter isDarkMode={isDarkMode} />
        )}
      </div>
    </div>
  );

  const renderFooter = () => (
    <footer className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              About Author
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
              A passionate writer and developer creating meaningful content for the community. Sharing insights on technology, lifestyle, and personal growth.
            </p>
          </div>
          
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => setCurrentPage('home')}
                  className={`text-sm ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors duration-200 cursor-pointer`}
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage('write')}
                  className={`text-sm ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors duration-200 cursor-pointer`}
                >
                  Write Blog
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage('generate')}
                  className={`text-sm ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors duration-200 cursor-pointer`}
                >
                  AI Generator
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Categories
            </h3>
            <ul className="space-y-2">
              <li className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Technology</li>
              <li className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Lifestyle</li>
              <li className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Business</li>
              <li className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Education</li>
            </ul>
          </div>
          
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Settings
            </h3>
            <div className="flex items-center space-x-3">
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Theme:
              </span>
              <button
                onClick={toggleTheme}
                className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-all duration-300 cursor-pointer whitespace-nowrap !rounded-button ${
                  isDarkMode 
                    ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                <span className="text-sm">{isDarkMode ? 'Light' : 'Dark'}</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className={`mt-8 pt-8 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} text-center`}>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            ©Built with React and Tailwind CSS.
          </p>
        </div>
      </div>
    </footer>
  );

  return (
    <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      {currentPage === 'home' && renderHomePage()}
      {currentPage === 'post-detail' && renderPostDetail()}
      {currentPage === 'write' && renderWritePage()}
      {currentPage === 'generate' && renderGeneratePage()}
      {renderFooter()}
    </div>
  );
};

export default App;
