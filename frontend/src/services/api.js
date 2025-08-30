import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (usernameOrEmail, password) => 
    api.post('/auth/login/', { username_or_email: usernameOrEmail, password }),
  
  register: (userData) => 
    api.post('/auth/register/', userData),
  
  getProfile: () => 
    api.get('/auth/profile/'),
  
  updateProfile: (profileData) => {
    const formData = new FormData();
    Object.keys(profileData).forEach(key => {
      if (profileData[key] !== null && profileData[key] !== undefined) {
        formData.append(key, profileData[key]);
      }
    });
    return api.put('/auth/profile/update/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  refreshToken: (refreshToken) => 
    api.post('/auth/token/refresh/', { refresh: refreshToken }),
};

// Blog API calls
export const blogAPI = {
  getBlogs: (params = {}) => 
    api.get('/blogs/', { params }),
  
  getBlog: (slug) => 
    api.get(`/blogs/${slug}/`),
  
  createBlog: (blogData) => {
    const formData = new FormData();
    Object.keys(blogData).forEach(key => {
      if (key === 'tags' && Array.isArray(blogData[key])) {
        blogData[key].forEach(tag => formData.append('tags', tag));
      } else if (blogData[key] !== null && blogData[key] !== undefined) {
        formData.append(key, blogData[key]);
      }
    });
    return api.post('/blogs/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  updateBlog: (slug, blogData) => {
    const formData = new FormData();
    Object.keys(blogData).forEach(key => {
      if (key === 'tags' && Array.isArray(blogData[key])) {
        blogData[key].forEach(tag => formData.append('tags', tag));
      } else if (blogData[key] !== null && blogData[key] !== undefined) {
        formData.append(key, blogData[key]);
      }
    });
    return api.put(`/blogs/${slug}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  deleteBlog: (slug) => 
    api.delete(`/blogs/${slug}/`),
  
  likeBlog: (blogId) => 
    api.post(`/blogs/${blogId}/like/`),
  
  bookmarkBlog: (blogId) => 
    api.post(`/blogs/${blogId}/bookmark/`),
  
  getMyBlogs: () => 
    api.get('/blogs/my-blogs/'),
  
  getBookmarkedBlogs: () => 
    api.get('/blogs/bookmarked/'),
  
  addBlogImage: (blogId, imageData) => {
    const formData = new FormData();
    formData.append('image', imageData.image);
    if (imageData.caption) formData.append('caption', imageData.caption);
    if (imageData.order) formData.append('order', imageData.order);
    return api.post(`/blogs/${blogId}/images/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  addBlogVideo: (blogId, videoData) => {
    const formData = new FormData();
    formData.append('video', videoData.video);
    if (videoData.thumbnail) formData.append('thumbnail', videoData.thumbnail);
    if (videoData.caption) formData.append('caption', videoData.caption);
    if (videoData.order) formData.append('order', videoData.order);
    return api.post(`/blogs/${blogId}/videos/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  deleteBlogImage: (imageId) => 
    api.delete(`/blogs/images/${imageId}/`),
  
  deleteBlogVideo: (videoId) => 
    api.delete(`/blogs/videos/${videoId}/`),
  
  getTags: () => 
    api.get('/blogs/tags/'),
  
  getCategories: () => 
    api.get('/blogs/categories/'),
  
  generateBlogContent: (prompt) => 
    api.post('/blogs/generate/', { prompt }),
  
  generateBlogFromVideo: (videoData) => {
    const formData = new FormData();
    if (videoData.youtube_url) formData.append('youtube_url', videoData.youtube_url);
    if (videoData.video_file) formData.append('video_file', videoData.video_file);
    return api.post('/blogs/generate-from-video/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

// Comment API calls
export const commentAPI = {
  getComments: (blogId) => 
    api.get(`/comments/blog/${blogId}/`),
  
  createComment: (blogId, content) => 
    api.post(`/comments/blog/${blogId}/`, { content }),
  
  updateComment: (commentId, content) => 
    api.put(`/comments/${commentId}/`, { content }),
  
  deleteComment: (commentId) => 
    api.delete(`/comments/${commentId}/`),
  
  replyToComment: (commentId, content) => 
    api.post(`/comments/${commentId}/reply/`, { content }),
};

// AI Generation API calls
export const aiAPI = {
  generateText: (prompt) => 
    api.post('/ai/text/', { prompt }),
  
  generateImage: (prompt, style = 'realistic') => 
    api.post('/ai/image/', { prompt, style }),
  
  processYouTube: (youtubeUrl) => 
    api.post('/ai/youtube/', { youtube_url: youtubeUrl }),
  
  generateVideoContent: (title, description) => 
    api.post('/ai/video/', { title, description }),
  
  getGenerationHistory: (type = null) => 
    api.get('/ai/history/', type ? { params: { type } } : {}),
  
  getGenerationStats: () => 
    api.get('/ai/stats/'),
};

export default api;
