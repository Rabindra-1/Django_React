import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const CommentModal = ({ isOpen, onClose, post, isDarkMode }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && post) {
      fetchComments();
    }
  }, [isOpen, post]);

  const fetchComments = async () => {
    if (!post) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/blogs/${post.id}/comments/`);
      setComments(response.data || []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      // No fallback data - show empty state when API fails
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setSubmitting(true);
    try {
      const response = await api.post(`/blogs/${post.id}/comments/`, {
        content: newComment.trim()
      });
      
      // Add new comment to the list
      setComments(prev => [response.data, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to submit comment:', error);
      alert('Failed to submit comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-2xl w-full max-h-[80vh] rounded-lg shadow-xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } overflow-hidden`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        } flex items-center justify-between`}>
          <h3 className={`text-lg font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Comments on "{post?.title}"
          </h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              isDarkMode 
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Comment Form */}
        {user ? (
          <div className={`px-6 py-4 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <form onSubmit={handleSubmitComment}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your comment..."
                rows={3}
                className={`w-full p-3 rounded-lg border transition-colors duration-200 text-sm resize-none ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    !newComment.trim() || submitting
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {submitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className={`px-6 py-4 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          } text-center`}>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Please log in to post a comment
            </p>
          </div>
        )}

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto max-h-96 px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className={`text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <i className="fas fa-spinner fa-spin text-2xl mb-2"></i>
                <p>Loading comments...</p>
              </div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <i className={`fas fa-comments text-4xl mb-4 ${
                isDarkMode ? 'text-gray-600' : 'text-gray-300'
              }`}></i>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No comments yet. Be the first to comment!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className={`p-4 rounded-lg ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {comment.author?.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className={`font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {comment.author?.username || 'Unknown User'}
                      </span>
                    </div>
                    <span className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
