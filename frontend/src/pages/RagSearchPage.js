import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useBlogContext } from '../contexts/BlogContext.js';
import { ragApi, handleApiError } from '../services/ragApi';
import { Search, AlertCircle, RefreshCw } from 'lucide-react';

/**
 * RAG Knowledge Search Page
 * Simple search interface following existing patterns
 */
const RagSearchPage = () => {
  const { isDarkMode } = useBlogContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  const searchMutation = useMutation({
    mutationFn: ragApi.searchKnowledgeBase,
    onSuccess: (data) => setSearchResults(data),
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchMutation.mutate({
        query: searchQuery,
        k: 8,
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            🔍 Knowledge Base Search
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Search through the knowledge base to find relevant information
          </p>
        </div>

        {/* Search Form */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-8`}>
          <div className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for topics, concepts, or information..."
              className={`flex-1 px-4 py-3 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            <button
              onClick={handleSearch}
              disabled={!searchQuery.trim() || searchMutation.isPending}
              className={`px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors ${
                (!searchQuery.trim() || searchMutation.isPending) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {searchMutation.isPending ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          </div>

          {searchMutation.error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
              <AlertCircle className="w-5 h-5 inline mr-2" />
              {handleApiError(searchMutation.error)}
            </div>
          )}
        </div>

        {/* Search Results */}
        {searchResults && (
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Search Results for "{searchResults.query}" ({searchResults.total_results} found)
            </h3>
            
            {searchResults.results.length === 0 ? (
              <div className="text-center py-8">
                <Search className={`w-12 h-12 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-4`} />
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                  No results found. Try different keywords.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.results.map((result, index) => (
                  <div 
                    key={result.id || index} 
                    className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {result.title}
                      </h4>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium ml-2">
                        {(result.similarity_score * 100).toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="flex gap-2 mb-3">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {result.metadata?.category || 'Uncategorized'}
                      </span>
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                        {result.metadata?.author || 'Unknown'}
                      </span>
                    </div>
                    
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                      {result.chunk?.length > 200 ? `${result.chunk.substring(0, 200)}...` : result.chunk}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!searchResults && !searchMutation.isPending && (
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-12 text-center`}>
            <Search className={`w-16 h-16 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-4`} />
            <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Search the Knowledge Base
            </h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Enter a search query above to find relevant documents and information
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RagSearchPage;
