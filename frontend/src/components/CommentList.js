import React, { useState, useEffect } from 'react';
import { MessageCircle, Loader2, Send, User } from 'lucide-react';
import Comment from './Comment';
import { commentAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useBlogContext } from '../contexts/BlogContext';

const CommentList = ({ blogId }) => {
  const { user } = useAuth();
  const { isDarkMode } = useBlogContext();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (blogId) {
      fetchComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blogId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await commentAPI.getComments(blogId);
      setComments(response.data.results || response.data);
    } catch (err) {
      setError('Failed to load comments');
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setSubmitting(true);
    try {
      await commentAPI.createComment(blogId, newComment);
      setNewComment('');
      await fetchComments(); // Refresh comments
    } catch (error) {
      console.error('Failed to create comment:', error);
      setError('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentUpdate = () => {
    fetchComments();
  };

  const handleCommentDelete = () => {
    fetchComments();
  };

  const handleReply = () => {
    fetchComments();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className={`w-6 h-6 animate-spin ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comments Header */}
      <div className="flex items-center space-x-2">
        <MessageCircle className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="space-y-3">
          <div className="flex items-start space-x-3">
            {user.profile?.avatar ? (
              <img
                src={user.profile.avatar}
                alt={user.username}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}
              `}>
                <User className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
            )}
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className={`
                  w-full px-4 py-3 rounded-lg border transition-colors duration-200 resize-none
                  ${isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20
                `}
                rows="3"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className={`
                flex items-center px-4 py-2 rounded-lg text-white transition-colors duration-200
                ${submitting || !newComment.trim()
                  ? (isDarkMode ? 'bg-gray-600' : 'bg-gray-400')
                  : (isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600')
                }
              `}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Post Comment
            </button>
          </div>
        </form>
      ) : (
        <div className={`
          text-center py-6 border rounded-lg
          ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}
        `}>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Please log in to post comments
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className={`
          p-4 rounded-lg border
          ${isDarkMode ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-800'}
        `}>
          {error}
        </div>
      )}

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              onUpdate={handleCommentUpdate}
              onDelete={handleCommentDelete}
              onReply={handleReply}
            />
          ))}
        </div>
      ) : (
        <div className={`
          text-center py-8
          ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}
        `}>
          <MessageCircle className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <p>No comments yet</p>
          <p className="text-sm mt-1">Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  );
};

export default CommentList;
