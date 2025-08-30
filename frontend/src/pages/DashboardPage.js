import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, FileText, Heart, MessageCircle, Eye, Wand2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBlogContext } from '../contexts/BlogContext';
import { aiAPI } from '../services/api';

const DashboardPage = () => {
  const { user } = useAuth();
  const { isDarkMode } = useBlogContext();
  const [stats, setStats] = useState(null);
  const [aiStats, setAiStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load AI generation stats
      const aiResponse = await aiAPI.getGenerationStats();
      setAiStats(aiResponse.data);
      
      // Mock blog stats for now
      setStats({
        totalBlogs: 12,
        totalViews: 1524,
        totalLikes: 89,
        totalComments: 45,
        recentBlogs: [
          { title: "Getting Started with React", views: 234, likes: 12 },
          { title: "Advanced JavaScript Concepts", views: 189, likes: 8 },
          { title: "Building Modern Web Apps", views: 156, likes: 15 }
        ]
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className={`text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
          <p className="text-lg opacity-75">Please log in to view your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Dashboard
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Welcome back, {user.first_name || user.username}! Here's your activity overview.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Blog Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-6`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Total Blogs
                      </p>
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {stats.totalBlogs}
                      </p>
                    </div>
                    <FileText className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                  </div>
                </div>

                <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-6`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Total Views
                      </p>
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {stats.totalViews.toLocaleString()}
                      </p>
                    </div>
                    <Eye className={`w-8 h-8 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} />
                  </div>
                </div>

                <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-6`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Total Likes
                      </p>
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {stats.totalLikes}
                      </p>
                    </div>
                    <Heart className={`w-8 h-8 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
                  </div>
                </div>

                <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-6`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Total Comments
                      </p>
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {stats.totalComments}
                      </p>
                    </div>
                    <MessageCircle className={`w-8 h-8 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* AI Generation Stats */}
              {aiStats && (
                <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-6`}>
                  <h3 className={`text-xl font-bold mb-4 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Wand2 className="w-5 h-5 mr-2" />
                    AI Generation Stats
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total Generations</span>
                      <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{aiStats.total_generations}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Success Rate</span>
                      <span className={`font-semibold text-green-500`}>{aiStats.success_rate.toFixed(1)}%</span>
                    </div>
                    {Object.entries(aiStats.by_type).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center">
                        <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} capitalize`}>{type}</span>
                        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Blog Performance */}
              {stats && stats.recentBlogs && (
                <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-6`}>
                  <h3 className={`text-xl font-bold mb-4 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Recent Blog Performance
                  </h3>
                  <div className="space-y-4">
                    {stats.recentBlogs.map((blog, index) => (
                      <div key={index} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {blog.title}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            {blog.views} views
                          </div>
                          <div className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            <Heart className="w-4 h-4 mr-1" />
                            {blog.likes} likes
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-6`}>
              <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <a
                  href="/create"
                  className={`flex flex-col items-center p-4 rounded-lg transition-colors duration-200 ${
                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <FileText className={`w-8 h-8 mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    New Blog
                  </span>
                </a>
                <a
                  href="/my-blogs"
                  className={`flex flex-col items-center p-4 rounded-lg transition-colors duration-200 ${
                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <Users className={`w-8 h-8 mb-2 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    My Blogs
                  </span>
                </a>
                <a
                  href="/bookmarks"
                  className={`flex flex-col items-center p-4 rounded-lg transition-colors duration-200 ${
                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <Heart className={`w-8 h-8 mb-2 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Bookmarks
                  </span>
                </a>
                <a
                  href="/profile"
                  className={`flex flex-col items-center p-4 rounded-lg transition-colors duration-200 ${
                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <Users className={`w-8 h-8 mb-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Profile
                  </span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
