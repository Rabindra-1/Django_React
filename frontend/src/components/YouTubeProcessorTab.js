import React, { useState } from 'react';
import { Youtube, Link, Copy, FileText, Trash2, Clock, Eye, Loader2 } from 'lucide-react';
import { aiAPI } from '../services/api';
import { useBlogContext } from '../contexts/BlogContext';

const YouTubeProcessorTab = () => {
  const { isDarkMode, setBlogForm } = useBlogContext();
  const [url, setUrl] = useState('');
  const [processedData, setProcessedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // YouTube URL validation regex
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;

  const validateYouTubeURL = (url) => {
    return youtubeRegex.test(url);
  };

  const handleProcessVideo = async (e) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    if (!validateYouTubeURL(url.trim())) {
      setError('Please enter a valid YouTube URL (e.g., https://www.youtube.com/watch?v=...)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await aiAPI.processYouTube(url.trim());
      setProcessedData({
        title: 'Demo: YouTube Video Processing',
        description: response.data.note || 'This is a demo response showing how YouTube processing would work.',
        transcript: response.data.blog_content || response.data.transcript || 'Mock transcript content would appear here.',
        duration: '5:30',
        views: '1,234,567'
      });
    } catch (err) {
      console.error('Error processing YouTube video:', err);
      setError(err.response?.data?.error || 'Failed to process YouTube video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyContent = (content) => {
    if (content) {
      navigator.clipboard.writeText(content)
        .then(() => alert('Content copied to clipboard!'))
        .catch(() => alert('Failed to copy content'));
    }
  };

  const handleClearData = () => {
    setProcessedData(null);
    setUrl('');
  };

  const handleUseForBlog = () => {
    if (processedData) {
      const blogContent = `# ${processedData.title}\n\n${processedData.description}\n\n## Video Summary\n\n${processedData.transcript}`;
      navigator.clipboard.writeText(blogContent)
        .then(() => alert('Blog content copied to clipboard! You can now paste it in the Write page.'))
        .catch(() => alert('Failed to copy blog content'));
    }
  };

  // Sample YouTube URLs for testing
  const sampleUrls = [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtu.be/dQw4w9WgXcQ",
    "https://www.youtube.com/watch?v=example123"
  ];

  return (
    <div>
      <h1 className={`text-4xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        YouTube Link Processor
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6 transition-colors duration-300`}>
          <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Extract Content from YouTube
          </h3>
          
          <form onSubmit={handleProcessVideo} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                YouTube URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 text-sm ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-red-500`}
                required
              />
              {url && !validateYouTubeURL(url) && (
                <p className="mt-1 text-xs text-red-500">Please enter a valid YouTube URL</p>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button 
                type="submit"
                disabled={loading || !url.trim() || !validateYouTubeURL(url.trim())}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  loading || !url.trim() || !validateYouTubeURL(url.trim())
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700 cursor-pointer'
                }`}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="fab fa-youtube mr-2"></i>
                    Process Video
                  </>
                )}
              </button>
              
              <button 
                type="button"
                onClick={handleClearData}
                className={`px-4 py-3 rounded-lg font-medium transition-colors duration-200 cursor-pointer ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </form>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          
          {/* Sample URLs */}
          <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <i className="fas fa-link mr-2 text-red-500"></i>
              Sample URLs for Testing:
            </h4>
            <div className="space-y-2">
              {sampleUrls.map((sampleUrl, index) => (
                <button
                  key={index}
                  onClick={() => setUrl(sampleUrl)}
                  className={`block w-full text-left text-xs p-2 rounded border transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-600' 
                      : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {sampleUrl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6 transition-colors duration-300`}>
          <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Processed Video Data
          </h3>
          
          {processedData ? (
            <div className="space-y-4">
              {/* Video Title */}
              <div>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <i className="fas fa-video mr-2"></i>Title:
                </h4>
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {processedData.title}
                  </p>
                </div>
              </div>
              
              {/* Video Description */}
              <div>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <i className="fas fa-align-left mr-2"></i>Description:
                </h4>
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} max-h-32 overflow-y-auto`}>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {processedData.description}
                  </p>
                </div>
              </div>
              
              {/* Video Transcript/Summary */}
              <div>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <i className="fas fa-file-text mr-2"></i>Transcript/Summary:
                </h4>
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} max-h-48 overflow-y-auto`}>
                  <p className={`text-sm whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {processedData.transcript}
                  </p>
                </div>
              </div>
              
              {/* Video Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className={`font-semibold mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <i className="fas fa-clock mr-2"></i>Duration:
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {processedData.duration || 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className={`font-semibold mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <i className="fas fa-eye mr-2"></i>Views:
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {processedData.views || 'N/A'}
                  </p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-4">
                <button
                  onClick={() => handleCopyContent(processedData.title)}
                  className={`px-3 py-2 rounded text-xs font-medium transition-colors duration-200 cursor-pointer ${
                    isDarkMode 
                      ? 'bg-blue-900 text-blue-300 hover:bg-blue-800' 
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  <i className="fas fa-copy mr-1"></i>Copy Title
                </button>
                
                <button
                  onClick={() => handleCopyContent(processedData.transcript)}
                  className={`px-3 py-2 rounded text-xs font-medium transition-colors duration-200 cursor-pointer ${
                    isDarkMode 
                      ? 'bg-green-900 text-green-300 hover:bg-green-800' 
                      : 'bg-green-50 text-green-600 hover:bg-green-100'
                  }`}
                >
                  <i className="fas fa-copy mr-1"></i>Copy Transcript
                </button>
                
                <button
                  onClick={handleUseForBlog}
                  className={`px-3 py-2 rounded text-xs font-medium transition-colors duration-200 cursor-pointer ${
                    isDarkMode 
                      ? 'bg-purple-900 text-purple-300 hover:bg-purple-800' 
                      : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                  }`}
                >
                  <i className="fas fa-edit mr-1"></i>Use for Blog
                </button>
                
                <button
                  onClick={() => setProcessedData(null)}
                  className={`px-3 py-2 rounded text-xs font-medium transition-colors duration-200 cursor-pointer ${
                    isDarkMode 
                      ? 'bg-red-900 text-red-300 hover:bg-red-800' 
                      : 'bg-red-50 text-red-600 hover:bg-red-100'
                  }`}
                >
                  <i className="fas fa-trash mr-1"></i>Clear
                </button>
              </div>
            </div>
          ) : (
            <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <i className="fab fa-youtube text-6xl mb-4 opacity-50 text-red-500"></i>
              <p>Processed video data will appear here...</p>
              <p className="text-xs mt-2 opacity-75">Enter a YouTube URL and click "Process Video" to extract content</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Usage Information */}
      <div className={`mt-8 p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
        <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <i className="fas fa-info-circle mr-2 text-red-500"></i>
          YouTube Processing Features:
        </h4>
        <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <li><strong>Video Metadata:</strong> Extract title, description, duration, and view count</li>
          <li><strong>Content Summary:</strong> Generate summaries or transcripts of video content</li>
          <li><strong>Blog Integration:</strong> Convert video content into blog post format</li>
          <li><strong>Copy Options:</strong> Copy individual elements or complete blog content</li>
          <li><strong>Backend Required:</strong> Full functionality requires Django backend with YouTube API integration</li>
        </ul>
        
        <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-yellow-50'} border ${isDarkMode ? 'border-gray-600' : 'border-yellow-200'}`}>
          <p className={`text-sm ${isDarkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
            <i className="fas fa-exclamation-triangle mr-2"></i>
            <strong>Note:</strong> This feature currently provides mock data. For actual YouTube processing, 
            ensure the backend is running with proper YouTube API configuration.
          </p>
        </div>
      </div>
    </div>
  );
};

export default YouTubeProcessorTab;
