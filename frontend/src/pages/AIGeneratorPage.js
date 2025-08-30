import React, { useState } from 'react';
import { Wand2, Type, Image, Youtube } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBlogContext } from '../contexts/BlogContext';
import TextGeneratorTab from '../components/TextGeneratorTab';
import ImageAnalyzer from '../components/ImageAnalyzer';
import YouTubeProcessorTab from '../components/YouTubeProcessorTab';

const AIGeneratorPage = () => {
  const { user } = useAuth();
  const { isDarkMode } = useBlogContext();
  const [activeTab, setActiveTab] = useState('text');

  const tabs = [
    { id: 'text', label: 'Text Generator', icon: Type, component: TextGeneratorTab },
    { id: 'image', label: 'Image Analyzer', icon: Image, component: ImageAnalyzer },
    { id: 'youtube', label: 'YouTube Processor', icon: Youtube, component: YouTubeProcessorTab },
  ];

  if (!user) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className={`text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <Wand2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
          <p className="text-lg opacity-75">Please log in to use AI generation features.</p>
        </div>
      </div>
    );
  }

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold mb-3 flex items-center justify-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Wand2 className="w-8 h-8 mr-3" />
            AI Content Generator
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Create amazing content with the power of AI
          </p>
        </div>

        {/* Tab Navigation */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg mb-6`}>
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center px-6 py-4 text-sm font-medium transition-colors duration-200 first:rounded-l-lg last:rounded-r-lg ${
                    activeTab === tab.id
                      ? isDarkMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : isDarkMode
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-6`}>
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>
    </div>
  );
};

export default AIGeneratorPage;
