import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.js';
import ProfilePage from './pages/ProfilePage.js';
import BlogDetailPage from './pages/BlogDetailPage.js';
import CreateBlogPage from './pages/CreateBlogPage.js';
import MyBlogsPage from './pages/MyBlogsPage.js';
import BookmarksPage from './pages/BookmarksPage.js';
import DashboardPage from './pages/DashboardPage.js';
import AIGeneratorPage from './pages/AIGeneratorPage.js';
import RagGeneratorPage from './pages/RagGeneratorPage.js';
import RagSearchPage from './pages/RagSearchPage.js';
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
                  <Route path="/" element={<HomePage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/blog/:slug" element={<BlogDetailPage />} />
                  <Route path="/create" element={<CreateBlogPage />} />
                  <Route path="/edit/:slug" element={<CreateBlogPage />} />
                  <Route path="/my-blogs" element={<MyBlogsPage />} />
                  <Route path="/bookmarks" element={<BookmarksPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/ai-generator" element={<AIGeneratorPage />} />
                  <Route path="/rag-generator" element={<RagGeneratorPage />} />
                  <Route path="/rag-search" element={<RagSearchPage />} />
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
