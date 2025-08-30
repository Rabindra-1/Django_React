import React, { useState } from 'react';
import { Wand2, Copy, FileText, Trash2, Lightbulb, Robot, Loader2 } from 'lucide-react';
import { aiAPI } from '../services/api';
import { useBlogContext } from '../contexts/BlogContext';

const TextGeneratorTab = () => {
  const { isDarkMode, setBlogForm } = useBlogContext();
  const [prompt, setPrompt] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateText = async (e) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Please enter a prompt for text generation');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await aiAPI.generateText(prompt);
      setGeneratedText(response.data.content);
    } catch (err) {
      console.error('Error generating text:', err);
      setError(err.response?.data?.error || 'Failed to generate text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = () => {
    if (generatedText) {
      navigator.clipboard.writeText(generatedText)
        .then(() => alert('Generated text copied to clipboard!'))
        .catch(() => alert('Failed to copy text'));
    }
  };

  const handleClearText = () => {
    setGeneratedText('');
    setPrompt('');
  };

  const handleUseForBlog = () => {
    if (generatedText) {
      // This could be enhanced to integrate with the blog form
      alert('To use this text in a blog post, copy the text and paste it in the Write page.');
      handleCopyText();
    }
  };

  return (
    <div>
      <h1 className={`text-4xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        AI Text Generator
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6 transition-colors duration-300`}>
          <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Generate Content
          </h3>
          
          <form onSubmit={handleGenerateText} className="space-y-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt here... (e.g., 'Write a blog post about artificial intelligence', 'Create a product description for eco-friendly shoes', etc.)"
              className={`w-full h-32 px-4 py-3 rounded-lg border transition-colors duration-200 text-sm resize-none ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              required
            />
            
            <div className="flex space-x-3">
              <button 
                type="submit"
                disabled={loading || !prompt.trim()}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  loading || !prompt.trim()
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                }`}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Generating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-magic mr-2"></i>
                    Generate Text
                  </>
                )}
              </button>
              
              <button 
                type="button"
                onClick={handleClearText}
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
          
          {/* Sample Prompts */}
          <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <i className="fas fa-lightbulb mr-2 text-yellow-500"></i>
              Sample Prompts:
            </h4>
            <div className="space-y-2">
              {[
                "Write a blog post about the benefits of renewable energy",
                "Create a product review for a smart fitness tracker",
                "Explain machine learning in simple terms for beginners",
                "Write a travel guide for visiting Japan in spring"
              ].map((samplePrompt, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(samplePrompt)}
                  className={`block w-full text-left text-xs p-2 rounded border transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-600' 
                      : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  "{samplePrompt}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6 transition-colors duration-300`}>
          <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Generated Output
          </h3>
          
          <div className={`min-h-64 max-h-96 overflow-y-auto p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            {generatedText ? (
              <div className={`whitespace-pre-wrap text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {generatedText}
              </div>
            ) : (
              <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <i className="fas fa-robot text-4xl mb-4 opacity-50"></i>
                <p>Your generated text will appear here...</p>
                <p className="text-xs mt-2 opacity-75">Enter a prompt and click "Generate Text" to get started</p>
              </div>
            )}
          </div>
          
          {generatedText && (
            <div className="mt-4 flex space-x-2">
              <button
                onClick={handleCopyText}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer ${
                  isDarkMode 
                    ? 'bg-blue-900 text-blue-300 hover:bg-blue-800' 
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                <i className="fas fa-copy mr-2"></i>
                Copy Text
              </button>
              
              <button
                onClick={handleUseForBlog}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer ${
                  isDarkMode 
                    ? 'bg-green-900 text-green-300 hover:bg-green-800' 
                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                }`}
              >
                <i className="fas fa-edit mr-2"></i>
                Use for Blog
              </button>
              
              <button
                onClick={() => setGeneratedText('')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer ${
                  isDarkMode 
                    ? 'bg-red-900 text-red-300 hover:bg-red-800' 
                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                }`}
              >
                <i className="fas fa-trash mr-2"></i>
                Clear
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Usage Tips */}
      <div className={`mt-8 p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
        <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <i className="fas fa-info-circle mr-2 text-blue-500"></i>
          Tips for Better Results:
        </h4>
        <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <li><strong>Be specific:</strong> Include details about tone, length, and target audience</li>
          <li><strong>Provide context:</strong> Mention the purpose of the content (blog post, email, etc.)</li>
          <li><strong>Use examples:</strong> Reference styles or formats you prefer</li>
          <li><strong>Iterate:</strong> Use the generated text as a starting point and refine your prompts</li>
          <li><strong>Backend Required:</strong> For full functionality, ensure the Django backend is running</li>
        </ul>
      </div>
    </div>
  );
};

export default TextGeneratorTab;
