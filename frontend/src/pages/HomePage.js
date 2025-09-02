import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBlogContext } from '../contexts/BlogContext';
import { Wand2, PenLine } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDarkMode } = useBlogContext();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-600'}`}>
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
              <a 
                href="/rag-generator" 
                className="inline-flex items-center px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                <Wand2 className="w-5 h-5 mr-2" />
                RAG Generator
              </a>
            </div>
          )}
        </div>

        {/* RAG Features Section */}
        <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {/* RAG Generator Card */}
          <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}>
            <div className="flex items-center mb-4">
              <Wand2 className="w-8 h-8 text-green-500 mr-3" />
              <h3 className="text-xl font-semibold">RAG Generator</h3>
            </div>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Generate comprehensive blog posts using Retrieval-Augmented Generation. 
              Our AI retrieves relevant content from Wikipedia, Reddit, and Medium to create informed, well-researched articles.
            </p>
            <button 
              onClick={() => navigate('/rag-generator')}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Start Generating
            </button>
          </div>
          
          {/* AI Generator Card */}
          <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}>
            <div className="flex items-center mb-4">
              <Wand2 className="w-8 h-8 text-purple-500 mr-3" />
              <h3 className="text-xl font-semibold">AI Generator</h3>
            </div>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Create blog posts using advanced AI models. 
              Generate creative content on any topic with our intelligent writing assistant.
            </p>
            <button 
              onClick={() => navigate('/ai-generator')}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Start Creating
            </button>
          </div>
          
          {/* Manual Writing Card */}
          <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}>
            <div className="flex items-center mb-4">
              <PenLine className="w-8 h-8 text-blue-500 mr-3" />
              <h3 className="text-xl font-semibold">Write Manually</h3>
            </div>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Craft your own blog posts with our rich text editor. 
              Full creative control with formatting tools and media support.
            </p>
            <button 
              onClick={() => navigate('/create')}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Writing
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomePage;
