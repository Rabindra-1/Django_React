import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BlogPlatformDesign from './pages/Blog-Platform-Design.js';
import ProfilePage from './pages/ProfilePage.js';
import Layout from './components/Layout.js';
import { AuthProvider } from './contexts/AuthContext';
import { CustomThemeProvider } from './contexts/ThemeContext';
import { BlogProvider } from './contexts/BlogContext.js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CustomThemeProvider>
          <BlogProvider>
            <Router>
              <Layout>
                <Routes>
                  <Route path="/" element={<BlogPlatformDesign />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Routes>
              </Layout>
            </Router>
          </BlogProvider>
        </CustomThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
