import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useBlogContext } from '../contexts/BlogContext.js';
import { ragApi, handleApiError } from '../services/ragApi';
import { 
  Wand2, 
  Search, 
  FileText, 
  Settings, 
  Copy, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Brain
} from 'lucide-react';

/**
 * Simple RAG Blog Generator Component
 * Uses existing project's styling patterns
 */
const SimpleRagGenerator = () => {
  const { isDarkMode } = useBlogContext();
  const [activeView, setActiveView] = useState('generate'); // 'generate' or 'search'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  // Form handling
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      topic: '',
      style: 'informative',
      length: 'medium',
      target_audience: 'general',
      num_context_docs: 3,
    },
  });

  // Queries
  const { data: status } = useQuery({
    queryKey: ['rag-status'],
    queryFn: ragApi.getStatus,
    refetchInterval: 30000,
  });

  const { data: config } = useQuery({
    queryKey: ['rag-config'],
    queryFn: ragApi.getConfig,
  });

  // Mutations
  const generateBlogMutation = useMutation({
    mutationFn: ragApi.generateBlogPost,
  });

  const generateOutlineMutation = useMutation({
    mutationFn: ragApi.generateOutline,
  });

  const searchMutation = useMutation({
    mutationFn: ragApi.searchKnowledgeBase,
    onSuccess: (data) => setSearchResults(data),
  });

  // Handlers
  const onSubmit = (data) => {
    generateBlogMutation.mutate(data);
  };

  const handleGenerateOutline = () => {
    const topic = watch('topic');
    if (topic) {
      generateOutlineMutation.mutate({
        topic,
        num_context_docs: watch('num_context_docs'),
      });
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchMutation.mutate({
        query: searchQuery,
        k: 5,
      });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            🤖 RAG Blog Generator
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Generate intelligent blog content using AI and semantic search
          </p>
        </div>

        {/* System Status */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-8 transition-colors duration-300`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              System Status
            </h2>
            <div className="flex gap-2">
              {status?.is_ready ? (
                <span className="flex items-center text-green-600 text-sm font-medium">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Ready
                </span>
              ) : (
                <span className="flex items-center text-yellow-600 text-sm font-medium">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Initializing
                </span>
              )}
              {status?.using_mock_generator && (
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                  Demo Mode
                </span>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'} p-4 rounded-lg`}>
              <div className="text-center">
                <div className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {status?.num_documents || 0}
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Documents
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-green-50'} p-4 rounded-lg`}>
              <div className="text-center">
                <div className={`text-lg font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  {status?.sentence_model?.split('-')[0] || 'N/A'}
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Model
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-purple-50'} p-4 rounded-lg`}>
              <div className="text-center">
                <div className={`text-lg font-semibold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  {status?.using_mock_generator ? 'Mock' : 'AI'}
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Generator
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex mb-6">
          <button
            onClick={() => setActiveView('generate')}
            className={`flex items-center px-6 py-3 rounded-l-lg font-medium transition-colors ${
              activeView === 'generate'
                ? 'bg-blue-600 text-white'
                : isDarkMode 
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Wand2 className="w-5 h-5 mr-2" />
            Generate Blog
          </button>
          <button
            onClick={() => setActiveView('search')}
            className={`flex items-center px-6 py-3 rounded-r-lg font-medium transition-colors ${
              activeView === 'search'
                ? 'bg-blue-600 text-white'
                : isDarkMode 
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Search className="w-5 h-5 mr-2" />
            Search Knowledge
          </button>
        </div>

        {/* Generate View */}
        {activeView === 'generate' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Configuration Form */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <h3 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <Settings className="w-5 h-5 inline mr-2" />
                Configuration
              </h3>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Blog Topic *
                  </label>
                  <input
                    {...register('topic', { required: 'Topic is required' })}
                    type="text"
                    placeholder="e.g., Machine Learning for Beginners"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {errors.topic && (
                    <p className="text-red-500 text-sm mt-1">{errors.topic.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Style
                    </label>
                    <select
                      {...register('style')}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    >
                      {config?.styles?.map((style) => (
                        <option key={style} value={style}>
                          {style.charAt(0).toUpperCase() + style.slice(1)}
                        </option>
                      )) || []}
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Length
                    </label>
                    <select
                      {...register('length')}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    >
                      {config?.lengths?.map((length) => (
                        <option key={length} value={length}>
                          {length.charAt(0).toUpperCase() + length.slice(1)}
                        </option>
                      )) || []}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Target Audience
                  </label>
                  <select
                    {...register('target_audience')}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  >
                    {config?.audiences?.map((audience) => (
                      <option key={audience} value={audience}>
                        {audience.charAt(0).toUpperCase() + audience.slice(1)}
                      </option>
                    )) || []}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Context Documents: {watch('num_context_docs')}
                  </label>
                  <input
                    {...register('num_context_docs', { min: 1, max: 10 })}
                    type="range"
                    min="1"
                    max="10"
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1</span>
                    <span>10</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleGenerateOutline}
                    disabled={!watch('topic') || generateOutlineMutation.isPending}
                    className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors ${
                      (!watch('topic') || generateOutlineMutation.isPending) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {generateOutlineMutation.isPending ? (
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <FileText className="w-5 h-5 mr-2" />
                    )}
                    Generate Outline
                  </button>
                  
                  <button
                    type="submit"
                    disabled={generateBlogMutation.isPending || !status?.is_ready}
                    className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors ${
                      (generateBlogMutation.isPending || !status?.is_ready) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {generateBlogMutation.isPending ? (
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Wand2 className="w-5 h-5 mr-2" />
                    )}
                    Generate Blog Post
                  </button>
                </div>
              </form>
            </div>

            {/* Generated Content */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              <h3 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Generated Content
              </h3>

              {/* Error Display */}
              {(generateBlogMutation.error || generateOutlineMutation.error) && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  <AlertCircle className="w-5 h-5 inline mr-2" />
                  {handleApiError(generateBlogMutation.error || generateOutlineMutation.error)}
                </div>
              )}

              {/* Loading State */}
              {(generateBlogMutation.isPending || generateOutlineMutation.isPending) && (
                <div className="text-center py-12">
                  <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {generateBlogMutation.isPending ? 'Generating blog post...' : 'Creating outline...'}
                  </p>
                </div>
              )}

              {/* Outline Display */}
              {generateOutlineMutation.data && (
                <div className="mb-6">
                  <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'} p-4 rounded-lg`}>
                    <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      📝 Blog Outline: {generateOutlineMutation.data.topic}
                    </h4>
                    <pre className={`whitespace-pre-wrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-mono`}>
                      {generateOutlineMutation.data.outline}
                    </pre>
                  </div>
                </div>
              )}

              {/* Blog Post Display */}
              {generateBlogMutation.data && (
                <div className="space-y-4">
                  {/* Metadata */}
                  <div className="flex gap-2 flex-wrap mb-4">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                      Style: {generateBlogMutation.data.style}
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                      Length: {generateBlogMutation.data.length}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      generateBlogMutation.data.using_mock 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {generateBlogMutation.data.using_mock ? 'Demo' : 'AI Generated'}
                    </span>
                  </div>

                  {/* Content */}
                  <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-6 rounded-lg max-h-96 overflow-y-auto`}>
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {generateBlogMutation.data.content}
                    </div>
                  </div>

                  {/* Context Info */}
                  {generateBlogMutation.data.retrieved_docs && generateBlogMutation.data.retrieved_docs.length > 0 && (
                    <details className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
                      <summary className={`cursor-pointer font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        📚 Context Information ({generateBlogMutation.data.retrieved_docs.length} docs)
                      </summary>
                      <div className="mt-4 space-y-2">
                        {generateBlogMutation.data.retrieved_docs.map((doc, index) => (
                          <div key={index} className={`${isDarkMode ? 'bg-gray-600' : 'bg-white'} p-3 rounded border`}>
                            <div className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {doc.title} ({(doc.similarity_score * 100).toFixed(1)}%)
                            </div>
                            <div className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                              {doc.chunk?.substring(0, 150)}...
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}

                  {/* Actions */}
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => copyToClipboard(generateBlogMutation.data.content)}
                      className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Content
                    </button>
                    <button
                      onClick={() => {
                        reset();
                        generateBlogMutation.reset();
                        generateOutlineMutation.reset();
                      }}
                      className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      New Post
                    </button>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!generateBlogMutation.data && !generateOutlineMutation.data && !generateBlogMutation.isPending && !generateOutlineMutation.isPending && (
                <div className="text-center py-12">
                  <Brain className={`w-16 h-16 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-4`} />
                  <h4 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Ready to generate content
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Enter a topic and configure your preferences to get started
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search View */}
        {activeView === 'search' && (
          <div className="max-w-4xl mx-auto">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
              <h3 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <Search className="w-5 h-5 inline mr-2" />
                Knowledge Base Search
              </h3>
              
              <div className="flex gap-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Search Results for "{searchResults.query}" ({searchResults.total_results} found)
                </h4>
                
                {searchResults.results.length === 0 ? (
                  <div className="text-center py-8">
                    <Search className={`w-12 h-12 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-4`} />
                    <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                      No results found. Try different keywords.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {searchResults.results.map((result, index) => (
                      <div 
                        key={result.id || index} 
                        className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {result.title}
                          </h5>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
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
                          {result.chunk?.length > 300 ? `${result.chunk.substring(0, 300)}...` : result.chunk}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleRagGenerator;
