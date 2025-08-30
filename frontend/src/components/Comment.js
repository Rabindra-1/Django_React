import React, { useState } from 'react';
import { Edit, Trash2, Reply, MoreVertical, User, Check, X, Send } from 'lucide-react';
import { commentAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useBlogContext } from '../contexts/BlogContext';

const Comment = ({ comment, onUpdate, onDelete, onReply }) => {
  const { user } = useAuth();
  const { isDarkMode } = useBlogContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [replyContent, setReplyContent] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  const isAuthor = user && user.id === comment.author.id;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;

    setLoading(true);
    try {
      await commentAPI.updateComment(comment.id, editContent);
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to update comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    setLoading(true);
    try {
      await commentAPI.deleteComment(comment.id);
      onDelete();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    setLoading(true);
    try {
      await commentAPI.replyToComment(comment.id, replyContent);
      setReplyContent('');
      setIsReplying(false);
      onReply();
    } catch (error) {
      console.error('Failed to reply to comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  const cancelReply = () => {
    setIsReplying(false);
    setReplyContent('');
  };

  return (
    <div className={`
      p-4 rounded-lg border
      ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}
    `}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* Avatar */}
          {comment.author.profile?.avatar ? (
            <img
              src={comment.author.profile.avatar}
              alt={comment.author.username}
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
            {/* Author and Date */}
            <div className="flex items-center space-x-2 mb-1">
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {comment.author.first_name} {comment.author.last_name}
              </span>
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                @{comment.author.username}
              </span>
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                •
              </span>
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {formatDate(comment.created_at)}
              </span>
              {comment.updated_at !== comment.created_at && (
                <span className={`text-xs italic ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  (edited)
                </span>
              )}
            </div>

            {/* Content */}
            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className={`
                    w-full px-3 py-2 rounded-lg border transition-colors duration-200 resize-none
                    ${isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                    }
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20
                  `}
                  rows="3"
                />
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleEdit}
                    disabled={loading}
                    className={`
                      flex items-center px-3 py-1 rounded text-white text-sm transition-colors duration-200
                      ${loading 
                        ? (isDarkMode ? 'bg-gray-600' : 'bg-gray-400')
                        : (isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600')
                      }
                    `}
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    disabled={loading}
                    className={`
                      flex items-center px-3 py-1 rounded text-sm transition-colors duration-200
                      ${isDarkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    <X className="w-3 h-3 mr-1" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} whitespace-pre-wrap`}>
                {comment.content}
              </p>
            )}

            {/* Reply Form */}
            {isReplying && (
              <div className="mt-3 space-y-3">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className={`
                    w-full px-3 py-2 rounded-lg border transition-colors duration-200 resize-none
                    ${isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                    }
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20
                  `}
                  rows="3"
                />
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleReply}
                    disabled={loading || !replyContent.trim()}
                    className={`
                      flex items-center px-3 py-1 rounded text-white text-sm transition-colors duration-200
                      ${loading || !replyContent.trim()
                        ? (isDarkMode ? 'bg-gray-600' : 'bg-gray-400')
                        : (isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600')
                      }
                    `}
                  >
                    <Send className="w-3 h-3 mr-1" />
                    Reply
                  </button>
                  <button
                    onClick={cancelReply}
                    disabled={loading}
                    className={`
                      flex items-center px-3 py-1 rounded text-sm transition-colors duration-200
                      ${isDarkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    <X className="w-3 h-3 mr-1" />
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative">
          {(user && (isAuthor || user.is_superuser)) && (
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`
                p-1 rounded-full transition-colors duration-200
                ${isDarkMode 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }
              `}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          )}

          {showMenu && (
            <div className={`
              absolute right-0 top-full mt-1 w-40 rounded-lg shadow-lg border z-10
              ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
            `}>
              {isAuthor && (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className={`
                    w-full px-4 py-2 text-left flex items-center text-sm transition-colors duration-200
                    ${isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
              )}
              {(isAuthor || user?.is_superuser) && (
                <button
                  onClick={() => {
                    handleDelete();
                    setShowMenu(false);
                  }}
                  className={`
                    w-full px-4 py-2 text-left flex items-center text-sm transition-colors duration-200
                    ${isDarkMode 
                      ? 'text-red-400 hover:bg-gray-700' 
                      : 'text-red-600 hover:bg-gray-50'
                    }
                  `}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {!isEditing && !isReplying && user && (
        <div className="mt-3 flex items-center space-x-4">
          <button
            onClick={() => setIsReplying(true)}
            className={`
              flex items-center text-sm transition-colors duration-200
              ${isDarkMode 
                ? 'text-gray-400 hover:text-white' 
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <Reply className="w-4 h-4 mr-1" />
            Reply
          </button>
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 pl-6 border-l-2 border-gray-200 dark:border-gray-700 space-y-4">
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment;
