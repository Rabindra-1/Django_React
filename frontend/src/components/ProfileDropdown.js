import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Profile dropdown component for authenticated users
 * @param {Object} props - Component props
 * @param {boolean} props.isDarkMode - Whether dark mode is active
 * @returns {React.Component} ProfileDropdown component
 */
const ProfileDropdown = ({ isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 p-2 rounded-lg transition-all duration-200 ${
          isDarkMode 
            ? 'bg-gray-800 hover:bg-gray-700 text-white' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
        }`}
      >
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
        }`}>
          {user?.avatar ? (
            <img 
              src={user.avatar} 
              alt="Profile" 
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            getInitials(getUserDisplayName())
          )}
        </div>
        
        {/* User Name (hidden on mobile) */}
        <span className="hidden md:block text-sm font-medium truncate max-w-32">
          {getUserDisplayName()}
        </span>
        
        {/* Dropdown Arrow */}
        <i className={`fas fa-chevron-down text-xs transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`}></i>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute right-0 mt-2 w-64 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50 ${
          isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          {/* User Info Header */}
          <div className={`px-4 py-3 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
              }`}>
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  getInitials(getUserDisplayName())
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {getUserDisplayName()}
                </p>
                <p className={`text-xs truncate ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/profile');
              }}
              className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <i className="fas fa-user w-4"></i>
              <span>My Profile</span>
            </button>
            
            <button
              onClick={() => {
                setIsOpen(false);
                // TODO: Implement settings page navigation
                alert('Settings page will be implemented in future updates');
              }}
              className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <i className="fas fa-cog w-4"></i>
              <span>Settings</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/?page=write'); // Navigate to the write page to see user's posts or write new ones
              }}
              className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <i className="fas fa-file-alt w-4"></i>
              <span>My Posts</span>
            </button>

            <div className={`border-t my-1 ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}></div>

            <button
              onClick={handleLogout}
              className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 transition-colors ${
                isDarkMode 
                  ? 'text-red-400 hover:bg-gray-700 hover:text-red-300' 
                  : 'text-red-600 hover:bg-red-50 hover:text-red-700'
              }`}
            >
              <i className="fas fa-sign-out-alt w-4"></i>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
