import api from '../services/api';

export const testApiConnection = async () => {
  const results = {
    baseConnection: false,
    authEndpoint: false,
    blogsEndpoint: false,
    error: null
  };

  try {
    console.log('Testing API connection...');
    
    // Test base connection without authentication
    try {
      const response = await fetch('http://localhost:8000/api/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      results.baseConnection = response.ok;
      console.log('Base connection result:', response.status);
    } catch (error) {
      console.log('Base connection failed:', error.message);
    }

    // Test auth endpoint
    try {
      const authResponse = await fetch('http://localhost:8000/api/auth/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      results.authEndpoint = authResponse.ok || authResponse.status === 401; // 401 is expected without auth
      console.log('Auth endpoint result:', authResponse.status);
    } catch (error) {
      console.log('Auth endpoint failed:', error.message);
    }

    // Test blogs endpoint
    try {
      const blogsResponse = await api.get('/blogs/');
      results.blogsEndpoint = true;
      console.log('Blogs endpoint result: SUCCESS');
    } catch (error) {
      console.log('Blogs endpoint failed:', error.message);
      results.error = error.message;
    }

  } catch (error) {
    console.error('API test failed:', error);
    results.error = error.message;
  }

  return results;
};

export const logApiTestResults = async () => {
  const results = await testApiConnection();
  
  console.log('\n=== API Connection Test Results ===');
  console.log('Base Connection:', results.baseConnection ? '✅ Success' : '❌ Failed');
  console.log('Auth Endpoint:', results.authEndpoint ? '✅ Success' : '❌ Failed');
  console.log('Blogs Endpoint:', results.blogsEndpoint ? '✅ Success' : '❌ Failed');
  
  if (results.error) {
    console.log('Error:', results.error);
  }
  
  console.log('================================\n');
  
  return results;
};
