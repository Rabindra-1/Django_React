/**
 * @param {string} dateString
 * @returns {string}
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * @param {string} dateString
 * @returns {string}
 */
export const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  const diffInDays = diffInHours / 24;

  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)} hours ago`;
  } else if (diffInDays < 7) {
    return `${Math.floor(diffInDays)} days ago`;
  } else {
    return formatDate(dateString);
  }
};

/**
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

/**
 * @param {string} category
 * @returns {string}
 */
export const getCategoryColor = (category) => {
  const colors = {
    tech: 'bg-blue-100 text-blue-800',
    lifestyle: 'bg-green-100 text-green-800',
    business: 'bg-purple-100 text-purple-800',
    sports: 'bg-orange-100 text-orange-800',
    education: 'bg-yellow-100 text-yellow-800',
    health: 'bg-pink-100 text-pink-800'
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
};

/**
 * @param {string} category
 * @returns {string}
 */
export const getCategoryColorDark = (category) => {
  const colors = {
    tech: 'bg-blue-900 text-blue-300',
    lifestyle: 'bg-green-900 text-green-300',
    business: 'bg-purple-900 text-purple-300',
    sports: 'bg-orange-900 text-orange-300',
    education: 'bg-yellow-900 text-yellow-300',
    health: 'bg-pink-900 text-pink-300'
  };
  return colors[category] || 'bg-gray-900 text-gray-300';
};

/**
 * @param {string} email
 * @returns {boolean}
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * @param {string} url
 * @returns {boolean}
 */
export const validateYouTubeUrl = (url) => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  return youtubeRegex.test(url);
};

/**
 * @param {string} title
 * @returns {string}
 */
export const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

/**
 * @param {Array} posts
 * @param {string} query
 * @returns {Array}
 */
export const searchPosts = (posts, query) => {
  if (!query.trim()) return posts;
  
  const lowercaseQuery = query.toLowerCase();
  return posts.filter(post =>
    post.title.toLowerCase().includes(lowercaseQuery) ||
    post.fullContent.toLowerCase().includes(lowercaseQuery) ||
    post.author.toLowerCase().includes(lowercaseQuery) ||
    post.category.toLowerCase().includes(lowercaseQuery)
  );
};

/**
 * @param {Array} posts
 * @param {string} category
 * @returns {Array}
 */
export const filterPostsByCategory = (posts, category) => {
  if (!category || category === 'all') return posts;
  return posts.filter(post => post.category === category);
};

/**
 * @param {Array} posts
 * @param {string} sortBy
 * @returns {Array}
 */
export const sortPosts = (posts, sortBy) => {
  return [...posts].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'likes':
        return b.likes - a.likes;
      case 'comments':
        return b.comments - a.comments;
      default:
        return 0;
    }
  });
};

/**
 * @param {string} content
 * @returns {number}
 */
export const getReadingTime = (content) => {
  const wordsPerMinute = 200;
  const wordCount = content.split(' ').length;
  return Math.ceil(wordCount / wordsPerMinute);
};

/**
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
};

/**
 * @param {Function} func
 * @param {number} wait
 * @returns {Function}
 */
export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
