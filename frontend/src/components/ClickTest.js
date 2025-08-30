import React, { useState, useEffect } from 'react';
import { logApiTestResults } from '../utils/apiTest';
import { useAuth } from '../contexts/AuthContext';
import { useBlog } from '../hooks/useBlog';

const ClickTest = () => {
  const [clickCount, setClickCount] = useState(0);
  const [lastClick, setLastClick] = useState('');
  const [apiResults, setApiResults] = useState(null);
  const { user } = useAuth();
  const { posts, loading, error } = useBlog();
  
  useEffect(() => {
    // Test API connection on component mount
    logApiTestResults().then(setApiResults);
  }, []);

  const handleSimpleClick = () => {
    console.log('Simple click handler executed');
    setClickCount(prev => prev + 1);
    setLastClick('Simple Button');
  };

  const handleComplexClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Complex click handler executed with event:', e);
    setClickCount(prev => prev + 1);
    setLastClick('Complex Button');
  };

  const handleNestedClick = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`Nested ${type} click handler executed`);
    setClickCount(prev => prev + 1);
    setLastClick(`Nested ${type}`);
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-lg max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Click Test Component</h2>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">Total Clicks: {clickCount}</p>
          <p className="text-sm text-gray-600 mb-4">Last Click: {lastClick}</p>
          
          {/* API Status */}
          <div className="mb-4 p-3 bg-gray-50 rounded border">
            <h3 className="font-semibold mb-2">System Status</h3>
            <p className="text-xs text-gray-600 mb-1">User: {user ? `✅ Logged in as ${user.username || user.email}` : '❌ Not authenticated'}</p>
            <p className="text-xs text-gray-600 mb-1">Posts: {loading ? 'Loading...' : `${posts.length} posts loaded`}</p>
            <p className="text-xs text-gray-600 mb-1">API Error: {error || 'None'}</p>
            {apiResults && (
              <>
                <p className="text-xs text-gray-600 mb-1">Base API: {apiResults.baseConnection ? '✅' : '❌'}</p>
                <p className="text-xs text-gray-600 mb-1">Auth API: {apiResults.authEndpoint ? '✅' : '❌'}</p>
                <p className="text-xs text-gray-600">Blogs API: {apiResults.blogsEndpoint ? '✅' : '❌'}</p>
              </>
            )}
          </div>
        </div>

        {/* Simple Button */}
        <button 
          onClick={handleSimpleClick}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Simple Button
        </button>

        {/* Complex Button */}
        <button 
          onClick={handleComplexClick}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Complex Button (with event handling)
        </button>

        {/* Nested Buttons Container */}
        <div 
          onClick={() => console.log('Container clicked')}
          className="border-2 border-dashed border-gray-300 p-4 rounded"
        >
          <p className="text-xs text-gray-500 mb-2">Clickable Container</p>
          
          <button 
            onClick={(e) => handleNestedClick(e, 'Inner')}
            className="mr-2 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Inner Button
          </button>
          
          <button 
            onClick={(e) => handleNestedClick(e, 'Sibling')}
            className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
          >
            Sibling Button
          </button>
        </div>

        {/* Reset Button */}
        <button 
          onClick={() => {
            setClickCount(0);
            setLastClick('');
            console.log('Reset clicked');
          }}
          className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default ClickTest;
