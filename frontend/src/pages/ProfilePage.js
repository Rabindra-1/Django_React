import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Edit, Save, X, Key, LogOut, Camera, Loader2, MapPin, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBlogContext } from '../contexts/BlogContext';
import { authAPI } from '../services/api';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { isDarkMode } = useBlogContext();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    bio: '',
    website: '',
    location: '',
    avatar: null
  });
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    if (user) {
      setEditForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        bio: user.profile?.bio || '',
        website: user.profile?.website || '',
        location: user.profile?.location || '',
        avatar: null
      });
      setAvatarPreview(user.profile?.avatar || '');
    }
  }, [user]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const getUserDisplayName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user?.username || user?.email || 'User';
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setError(null);
    setSuccess(null);
    
    if (!isEditing && user) {
      // Reset form to current user data when starting to edit
      setEditForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        bio: user.profile?.bio || '',
        website: user.profile?.website || '',
        location: user.profile?.location || '',
        avatar: null
      });
      setAvatarPreview(user.profile?.avatar || '');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'avatar' && files && files[0]) {
      const file = files[0];
      setEditForm(prev => ({ ...prev, avatar: file }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setEditForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authAPI.updateProfile(editForm);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Refresh the page or update user data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300 flex items-center justify-center`}>
        <div className={`text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
          <p className="text-lg opacity-75">Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            My Profile
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Manage your account information and preferences
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 rounded-lg bg-green-100 border border-green-200 text-green-800">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-100 border border-red-200 text-red-800">
            {error}
          </div>
        )}

        {/* Profile Card */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-8 transition-colors duration-300 mb-6`}>
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              {/* Avatar */}
              <div className="relative">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold overflow-hidden ${
                  isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                }`}>
                  {(avatarPreview || user.profile?.avatar) ? (
                    <img 
                      src={avatarPreview || user.profile.avatar} 
                      alt="Profile" 
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    getInitials(getUserDisplayName())
                  )}
                </div>
                {isEditing && (
                  <label className={`absolute bottom-0 right-0 p-2 rounded-full cursor-pointer ${
                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  }`}>
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      name="avatar"
                      accept="image/*"
                      onChange={handleInputChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              <div>
                <h2 className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {getUserDisplayName()}
                </h2>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                  @{user.username}
                </p>
                <div className={`flex items-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Calendar className="w-4 h-4 mr-1" />
                  Member since {user.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'Recently'}
                </div>
              </div>
            </div>
            
            <button
              onClick={handleEditToggle}
              disabled={loading}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                isEditing
                  ? (isDarkMode ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-500 hover:bg-gray-600 text-white')
                  : (isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white')
              }`}
            >
              {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {/* Profile Information */}
          {isEditing ? (
            <form onSubmit={handleSaveChanges} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={editForm.first_name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
                    placeholder="Enter your first name"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={editForm.last_name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={editForm.bio}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 resize-none ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={editForm.website}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
                    placeholder="https://example.com"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={editForm.location}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
                    placeholder="City, Country"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleEditToggle}
                  disabled={loading}
                  className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 disabled:bg-blue-400"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Bio */}
              {user.profile?.bio && (
                <div>
                  <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {user.profile.bio}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Email
                  </label>
                  <div className={`flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Mail className="w-4 h-4 mr-2" />
                    <span className="text-lg">{user.email || 'Not provided'}</span>
                  </div>
                </div>

                {user.profile?.location && (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Location
                    </label>
                    <div className={`flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="text-lg">{user.profile.location}</span>
                    </div>
                  </div>
                )}
              </div>

              {user.profile?.website && (
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Website
                  </label>
                  <div className={`flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Globe className="w-4 h-4 mr-2" />
                    <a 
                      href={user.profile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-lg text-blue-500 hover:text-blue-600 transition-colors duration-200"
                    >
                      {user.profile.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Account Actions */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-8 transition-colors duration-300`}>
          <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Account Actions
          </h3>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => alert('Change password functionality will be implemented')}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                  : 'bg-yellow-500 hover:bg-yellow-600 text-white'
              }`}
            >
              <Key className="w-4 h-4 mr-2" />
              Change Password
            </button>
            
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to log out?')) {
                  logout();
                  window.location.href = '/';
                }
              }}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
