/**
 * API service for the RAG Blog System
 * Handles all communication with the FastAPI backend
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds for AI generation
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * RAG API service methods
 */
export const ragApi = {
  /**
   * Get system status
   * @returns {Promise<Object>} System status information
   */
  async getStatus() {
    try {
      const response = await apiClient.get('/status');
      const data = response.data;
      
      // Transform to match frontend expectations
      return {
        is_ready: data.status === 'operational' || data.status === 'partial',
        num_documents: data.components?.rag_system?.vector_database?.total_vectors || 0,
        sentence_model: data.components?.rag_system?.embedding_model?.model_name || 'unknown-model',
        using_mock_generator: data.components?.blog_generator?.status !== 'loaded',
        status: data.status,
        components: data.components
      };
    } catch (error) {
      // Return default status if backend is not available
      return {
        is_ready: false,
        num_documents: 0,
        sentence_model: 'unavailable',
        using_mock_generator: true,
        status: 'error',
        error: error.message
      };
    }
  },

  /**
   * Get system configuration options
   * @returns {Promise<Object>} Available configuration options
   */
  async getConfig() {
    // Return default config since our backend doesn't have a /config endpoint
    return {
      styles: ['informative', 'conversational', 'technical', 'casual'],
      lengths: ['short', 'medium', 'long'],
      audiences: ['general', 'beginner', 'intermediate', 'expert']
    };
  },

  /**
   * Generate a complete blog post
   * @param {Object} request - Blog generation parameters
   * @param {string} request.topic - Blog post topic
   * @param {string} request.style - Writing style
   * @param {string} request.length - Content length
   * @param {string} request.target_audience - Target audience
   * @param {number} request.num_context_docs - Number of context documents
   * @returns {Promise<Object>} Generated blog post data
   */
  async generateBlogPost(request) {
    const response = await apiClient.post('/generate-blog', {
      topic: request.topic,
      max_sources: request.num_context_docs || 3
    });
    
    // Transform response to match expected format
    const data = response.data;
    return {
      content: `# ${data.title}\n\n${data.introduction}\n\n${data.main_content}\n\n## Conclusion\n\n${data.conclusion}`,
      style: request.style || 'informative',
      length: request.length || 'medium',
      using_mock: data.metadata?.fallback_used || false,
      retrieved_docs: data.sources?.map(source => ({
        title: source.title,
        similarity_score: source.relevance_score || 0.8,
        chunk: source.title // Using title as chunk preview
      })) || []
    };
  },

  /**
   * Generate a blog post outline
   * @param {Object} request - Outline generation parameters
   * @param {string} request.topic - Blog post topic
   * @param {number} request.num_context_docs - Number of context documents
   * @returns {Promise<Object>} Generated outline data
   */
  async generateOutline(request) {
    const response = await apiClient.post('/generate-outline', request);
    return response.data.data;
  },

  /**
   * Search the knowledge base
   * @param {Object} request - Search parameters
   * @param {string} request.query - Search query
   * @param {number} request.k - Number of results to return
   * @returns {Promise<Object>} Search results
   */
  async searchKnowledgeBase(request) {
    const response = await apiClient.post('/search', request);
    return response.data.data;
  },

  /**
   * Enhance existing content
   * @param {Object} request - Content enhancement parameters
   * @param {string} request.section_title - Section title
   * @param {string} request.existing_content - Current content
   * @param {string} [request.search_query] - Optional search query
   * @returns {Promise<string>} Enhanced content
   */
  async enhanceContent(request) {
    const response = await apiClient.post('/enhance-content', request);
    return response.data.data.enhanced_content;
  },

  /**
   * Upload documents to knowledge base
   * @param {Array} documents - Array of document objects
   * @returns {Promise<Object>} Upload result
   */
  async uploadDocuments(documents) {
    const response = await apiClient.post('/upload-documents', { documents });
    return response.data.data;
  },
};

/**
 * Handle API errors and return user-friendly messages
 * @param {Error} error - The error object
 * @returns {string} User-friendly error message
 */
export const handleApiError = (error) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.detail || error.message;
  }
  return 'An unexpected error occurred';
};

export default ragApi;
