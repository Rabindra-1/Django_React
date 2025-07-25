// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
};

// Blog Categories
export const BLOG_CATEGORIES = [
  { value: 'tech', label: 'Technology', icon: 'fas fa-laptop-code' },
  { value: 'lifestyle', label: 'Lifestyle', icon: 'fas fa-heart' },
  { value: 'business', label: 'Business', icon: 'fas fa-briefcase' },
  { value: 'sports', label: 'Sports', icon: 'fas fa-football-ball' },
  { value: 'education', label: 'Education', icon: 'fas fa-graduation-cap' },
  { value: 'health', label: 'Health', icon: 'fas fa-stethoscope' }
];

// Navigation Pages
export const PAGES = {
  HOME: 'home',
  WRITE: 'write',
  GENERATE: 'generate',
  POST_DETAIL: 'post-detail',
  PROFILE: 'profile',
  SETTINGS: 'settings'
};

// Generation Sub-pages
export const GENERATION_TYPES = {
  TEXT: 'text',
  YOUTUBE: 'youtube',
  VIDEO: 'video',
  IMAGE: 'image'
};

// Theme Configuration
export const THEME_CONFIG = {
  STORAGE_KEY: 'blogHub_theme',
  DEFAULT_THEME: 'light',
  TRANSITION_DURATION: 300
};

// Validation Rules
export const VALIDATION_RULES = {
  BLOG_TITLE: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 200
  },
  BLOG_CONTENT: {
    MIN_LENGTH: 50,
    MAX_LENGTH: 10000
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL: true
  }
};

// UI Constants
export const UI_CONFIG = {
  POSTS_PER_PAGE: 10,
  PREVIEW_LENGTH: 150,
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
  ANIMATION_DURATION: 200
};

// AI Generation Limits
export const AI_LIMITS = {
  TEXT_PROMPT_MAX_LENGTH: 500,
  IMAGE_PROMPT_MAX_LENGTH: 300,
  DAILY_GENERATIONS: 10,
  MAX_RETRIES: 3
};

// Social Media Links
export const SOCIAL_LINKS = {
  TWITTER: 'https://twitter.com/bloghub',
  FACEBOOK: 'https://facebook.com/bloghub',
  LINKEDIN: 'https://linkedin.com/company/bloghub',
  INSTAGRAM: 'https://instagram.com/bloghub'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You need to log in to perform this action.',
  FORBIDDEN: 'You don\'t have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Internal server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  POST_CREATED: 'Blog post created successfully!',
  POST_UPDATED: 'Blog post updated successfully!',
  POST_DELETED: 'Blog post deleted successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  EMAIL_VERIFIED: 'Email verified successfully!',
  LOGIN_SUCCESS: 'Logged in successfully!',
  LOGOUT_SUCCESS: 'Logged out successfully!'
};

// Loading States
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

// File Upload Configuration
export const FILE_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'text/plain', 'application/msword']
};

// Keyboard Shortcuts
export const KEYBOARD_SHORTCUTS = {
  SAVE_POST: 'Ctrl+S',
  NEW_POST: 'Ctrl+N',
  TOGGLE_THEME: 'Ctrl+Shift+T',
  SEARCH: 'Ctrl+K',
  CLOSE_MODAL: 'Escape'
};

// Default Values
export const DEFAULTS = {
  AVATAR_URL: '/images/default-avatar.png',
  POST_IMAGE_URL: '/images/default-post.jpg',
  ITEMS_PER_PAGE: 12,
  SEARCH_DELAY: 500
};

export default {
  API_CONFIG,
  BLOG_CATEGORIES,
  PAGES,
  GENERATION_TYPES,
  THEME_CONFIG,
  VALIDATION_RULES,
  UI_CONFIG,
  AI_LIMITS,
  SOCIAL_LINKS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LOADING_STATES,
  FILE_CONFIG,
  KEYBOARD_SHORTCUTS,
  DEFAULTS
};
