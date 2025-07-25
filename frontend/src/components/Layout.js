import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBlogContext } from '../contexts/BlogContext.js';
import AuthModal from './AuthModal';
import ProfileDropdown from './ProfileDropdown';

const Layout = ({ children }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useBlogContext();
  const location = useLocation();
  const navigate = useNavigate();

  const renderNavigation = () => (
    <nav className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-b transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link 
              to="/" 
              className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} hover:opacity-80 transition-opacity duration-200`}
            >
              Rawan
            </Link>
            <div className="flex space-x-6">
              <Link
                to="/"
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer whitespace-nowrap !rounded-button ${
                  location.pathname === '/'
                    ? isDarkMode ? 'text-blue-400 border-b-2 border-blue-400' : 'text-blue-600 border-b-2 border-blue-600'
                    : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Home
              </Link>
              {user && (
                <>
                  <button
                    onClick={() => navigate('/?page=write')}
                    className={`px-3 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer whitespace-nowrap !rounded-button ${
                      location.search === '?page=write'
                        ? isDarkMode ? 'text-blue-400 border-b-2 border-blue-400' : 'text-blue-600 border-b-2 border-blue-600'
                        : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    Write
                  </button>
                  <button
                    onClick={() => navigate('/?page=generate')}
                    className={`px-3 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer whitespace-nowrap !rounded-button ${
                      location.search === '?page=generate'
                        ? isDarkMode ? 'text-blue-400 border-b-2 border-blue-400' : 'text-blue-600 border-b-2 border-blue-600'
                        : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    Generate
                  </button>
                  <Link
                    to="/profile"
                    className={`px-3 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer whitespace-nowrap !rounded-button ${
                      location.pathname === '/profile'
                        ? isDarkMode ? 'text-blue-400 border-b-2 border-blue-400' : 'text-blue-600 border-b-2 border-blue-600'
                        : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    Profile
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all duration-300 cursor-pointer !rounded-button ${
                isDarkMode 
                  ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-lg`}></i>
            </button>
            
            {/* Auth Section */}
            {user ? (
              <ProfileDropdown isDarkMode={isDarkMode} />
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );

  return (
    <>
      <style>{`
        .!rounded-button {
          border-radius: 0.5rem;
        }
        
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        
        input[type="number"] {
          -moz-appearance: textfield;
        }
        
        .dark {
          color-scheme: dark;
        }
      `}</style>
      
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
        {renderNavigation()}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default Layout;
