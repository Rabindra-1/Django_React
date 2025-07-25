import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBlogContext } from '../contexts/BlogContext';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { isDarkMode } = useBlogContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    firstName: user?.first_name || '',
    lastName: user?.last_name || ''
  });

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
    if (!isEditing) {
      // Reset form to current user data when starting to edit
      setEditForm({
        username: user?.username || '',
        email: user?.email || '',
        firstName: user?.first_name || '',
        lastName: user?.last_name || ''
      });
    }
  };

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    // TODO: Implement API call to update user profile
    console.log('Saving changes:', editForm);
    alert('Profile update functionality will be implemented with backend integration');
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300 flex items-center justify-center`}>
        <div className={`text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <i className="fas fa-lock text-6xl mb-4 opacity-50"></i>
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

        {/* Profile Card */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-8 transition-colors duration-300 mb-6`}>
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              {/* Avatar */}
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${
                isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
              }`}>
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt="Profile" 
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  getInitials(getUserDisplayName())
                )}
              </div>
              
              <div>
                <h2 className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {getUserDisplayName()}
                </h2>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Member since {user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'Recently'}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleEditToggle}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                isEditing
                  ? 'bg-gray-500 hover:bg-gray-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
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
                    name="firstName"
                    value={editForm.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                    placeholder="Enter your first name"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={editForm.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={editForm.username}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                  placeholder="Enter your username"
                />
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
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleEditToggle}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Username
                  </label>
                  <p className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {user?.username || 'Not provided'}
                  </p>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Email
                  </label>
                  <p className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {user?.email || 'Not provided'}
                  </p>
                </div>
              </div>
              
              {(user?.first_name || user?.last_name) && (
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Full Name
                  </label>
                  <p className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {user.first_name} {user.last_name}
                  </p>
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
          
          <div className="space-y-4">
            <button
              onClick={() => alert('Change password functionality will be implemented')}
              className={`w-full md:w-auto px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                  : 'bg-yellow-500 hover:bg-yellow-600 text-white'
              }`}
            >
              <i className="fas fa-key mr-2"></i>
              Change Password
            </button>
            
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to log out?')) {
                  logout();
                  window.location.href = '/'; // Redirect to home after logout
                }
              }}
              className={`w-full md:w-auto px-6 py-3 rounded-lg font-medium transition-colors duration-200 ml-0 md:ml-4 ${
                isDarkMode 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
