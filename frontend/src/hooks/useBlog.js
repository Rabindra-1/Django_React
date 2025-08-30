import { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Custom hook for managing blog data and API calls
 * @returns {Object} Blog management functions and state
 */
export const useBlog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Empty fallback array - no default sample data
  const samplePosts = [];

  const transformApiPost = (apiPost) => {
    // Transform API post to frontend format
    const content = apiPost.content || '';
    const shortContent = content.length > 150 
      ? content.substring(0, 150) + '...' 
      : content;
    
    return {
      id: apiPost.id,
      title: apiPost.title,
      author: apiPost.author, // Keep the full author object
      date: apiPost.created_at ? new Date(apiPost.created_at).toLocaleDateString() : 'Unknown Date',
      category: apiPost.category, // Keep the full category object
      shortContent,
      fullContent: content,
      likes: apiPost.likes_count || 0,
      likes_count: apiPost.likes_count || 0, // Keep both for compatibility
      comments: apiPost.comments_count || 0,
      comments_count: apiPost.comments_count || 0, // Keep both for compatibility
      created_at: apiPost.created_at,
      updated_at: apiPost.updated_at,
      slug: apiPost.slug,
      layout_type: apiPost.layout_type,
      featured_image: apiPost.featured_image,
      tags: apiPost.tags || [],
      images: apiPost.images || [], // Include images array
      videos: apiPost.videos || [], // Include videos array
      is_liked: apiPost.is_liked || false,
      is_bookmarked: apiPost.is_bookmarked || false
    };
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/blogs/');
      const apiPosts = response.data.results || response.data;
      
      // Transform API posts to frontend format
      const transformedPosts = Array.isArray(apiPosts) 
        ? apiPosts.map(transformApiPost)
        : [];
      
      setPosts(transformedPosts);
      setError(null);
    } catch (err) {
      console.warn('Failed to fetch posts from API, using sample data:', err);
      setPosts(samplePosts);
      setError(null); // Use sample data, so no error
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create a new blog post
   * @param {Object} postData - The blog post data
   * @returns {Promise<Object>} Success status and error message if any
   */
  const createPost = async (postData) => {
    try {
      const response = await api.post('/blogs/', postData);
      
      // Transform the new post and add it to the top of the list
      const transformedPost = transformApiPost(response.data);
      setPosts(prev => [transformedPost, ...prev]);
      
      // Also refresh the entire list to ensure consistency
      await fetchPosts();
      
      return { 
        success: true, 
        data: response.data // Return the created blog data with ID
      };
    } catch (err) {
      console.error('Error creating post:', err);
      const errorMessage = err.response?.data?.detail 
        || err.response?.data?.message 
        || err.response?.data?.error
        || 'Failed to create post';
      
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  /**
   * Like a blog post
   * @param {number} postId - The ID of the post to like
   * @returns {Promise<Object>} Success status
   */
  const likePost = async (postId) => {
    try {
      const response = await api.post(`/blogs/${postId}/like/`);
      const { liked, likes_count } = response.data;
      
      // Update the post with the actual server response
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likes: likes_count,
              is_liked: liked
            }
          : post
      ));
      
      return { success: true, liked, likes_count };
    } catch (err) {
      console.error('Failed to like post:', err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    error,
    fetchPosts,
    createPost,
    likePost,
    refetch: fetchPosts
  };
};
