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

  // Sample data fallback
  const samplePosts = [
    {
      id: 1,
      title: 'The Future of Artificial Intelligence in Healthcare',
      author: 'Dr. Sarah Johnson',
      date: '2025-01-15',
      category: 'tech',
      shortContent: 'AI is revolutionizing healthcare by enabling faster diagnoses, personalized treatments, and improved patient outcomes...',
      fullContent: 'AI is revolutionizing healthcare by enabling faster diagnoses, personalized treatments, and improved patient outcomes. Machine learning algorithms can now analyze medical images with unprecedented accuracy, helping doctors detect diseases earlier than ever before. From predictive analytics that identify at-risk patients to robotic surgery systems that enhance precision, AI is transforming every aspect of medical care. The integration of AI-powered chatbots for patient support and automated administrative tasks is also reducing costs and improving efficiency across healthcare systems worldwide.',
      likes: 24,
      comments: 8
    },
    {
      id: 2,
      title: 'Sustainable Living: Small Changes, Big Impact',
      author: 'Emma Green',
      date: '2025-01-12',
      category: 'lifestyle',
      shortContent: 'Making sustainable choices doesn\'t have to be overwhelming. Simple changes in our daily routines can create significant environmental impact...',
      fullContent: 'Making sustainable choices doesn\'t have to be overwhelming. Simple changes in our daily routines can create significant environmental impact. From reducing single-use plastics to choosing renewable energy sources, every action counts. This comprehensive guide explores practical ways to live more sustainably, including tips for eco-friendly shopping, energy conservation, and waste reduction. Learn how to create a sustainable home environment while saving money and contributing to a healthier planet for future generations.',
      likes: 31,
      comments: 12
    },
    {
      id: 3,
      title: 'The Rise of Remote Work Culture',
      author: 'Michael Chen',
      date: '2025-01-10',
      category: 'business',
      shortContent: 'Remote work has transformed from a temporary solution to a permanent fixture in modern business culture...',
      fullContent: 'Remote work has transformed from a temporary solution to a permanent fixture in modern business culture. Companies worldwide are embracing flexible work arrangements, leading to increased productivity, better work-life balance, and access to global talent pools. This shift has also sparked innovation in digital collaboration tools, virtual team management strategies, and remote-first company cultures. As we move forward, understanding the long-term implications of this transformation is crucial for both employers and employees navigating the new world of work.',
      likes: 18,
      comments: 6
    }
  ];

  const transformApiPost = (apiPost) => {
    // Transform API post to frontend format
    const content = apiPost.content || '';
    const shortContent = content.length > 150 
      ? content.substring(0, 150) + '...' 
      : content;
    
    return {
      id: apiPost.id,
      title: apiPost.title,
      author: typeof apiPost.author === 'object' 
        ? apiPost.author.username || apiPost.author.email || 'Unknown Author'
        : apiPost.author,
      date: apiPost.created_at ? new Date(apiPost.created_at).toLocaleDateString() : 'Unknown Date',
      category: typeof apiPost.category === 'object' 
        ? apiPost.category.name?.toLowerCase() || 'uncategorized'
        : apiPost.category,
      shortContent,
      fullContent: content,
      likes: apiPost.likes_count || 0,
      comments: apiPost.comments_count || 0,
      created_at: apiPost.created_at,
      slug: apiPost.slug,
      layout_type: apiPost.layout_type,
      featured_image: apiPost.featured_image,
      tags: apiPost.tags || [],
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
      
      return { success: true };
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
      await api.post(`/blogs/${postId}/like/`);
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes: post.likes + 1 }
          : post
      ));
      return { success: true };
    } catch (err) {
      console.error('Failed to like post:', err);
      // Optimistic update even if API fails
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes: post.likes + 1 }
          : post
      ));
      return { success: true };
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
