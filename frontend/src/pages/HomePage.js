import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  IconButton,
  Avatar
} from '@mui/material';
import {
  Search as SearchIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const HomePage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('-created_at');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, [searchTerm, selectedCategory, sortBy, currentPage]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        ordering: sortBy,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { 'tags__name': selectedCategory }),
      };

      const response = await api.get('/blogs/', { params });
      setBlogs(response.data.results || response.data);
      
      if (response.data.count) {
        setTotalPages(Math.ceil(response.data.count / 12));
      }
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/blogs/tags/');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleLike = async (blogId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const response = await api.post(`/blogs/${blogId}/like/`);
      setBlogs(blogs.map(blog => 
        blog.id === blogId 
          ? { 
              ...blog, 
              is_liked: response.data.liked,
              likes_count: response.data.likes_count 
            }
          : blog
      ));
    } catch (error) {
      console.error('Failed to like blog:', error);
    }
  };

  const handleBookmark = async (blogId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const response = await api.post(`/blogs/${blogId}/bookmark/`);
      setBlogs(blogs.map(blog => 
        blog.id === blogId 
          ? { ...blog, is_bookmarked: response.data.bookmarked }
          : blog
      ));
    } catch (error) {
      console.error('Failed to bookmark blog:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateContent = (content, maxLength = 150) => {
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length > maxLength
      ? textContent.substring(0, maxLength) + '...'
      : textContent;
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Discover Amazing Blogs
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Explore a world of knowledge, stories, and insights from our community
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={typeof category === 'object' ? category.name : category}>
                    {typeof category === 'object' ? category.name : category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="-created_at">Latest</MenuItem>
                <MenuItem value="created_at">Oldest</MenuItem>
                <MenuItem value="-likes_count">Most Liked</MenuItem>
                <MenuItem value="-views_count">Most Viewed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Blog Grid */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography>Loading blogs...</Typography>
        </Box>
      ) : blogs.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No blogs found
          </Typography>
          <Typography color="text.secondary">
            Try adjusting your search or filters
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {blogs.map((blog) => (
            <Grid item xs={12} sm={6} md={4} key={blog.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  }
                }}
                onClick={() => navigate(`/blog/${blog.slug}`)}
              >
                {blog.featured_image && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={blog.featured_image}
                    alt={blog.title}
                    sx={{ objectFit: 'cover' }}
                  />
                )}
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {blog.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {truncateContent(blog.content)}
                  </Typography>
                  
                  {/* Tags */}
                  <Box sx={{ mb: 2 }}>
                    {blog.tags?.slice(0, 3).map((tag, index) => (
                      <Chip
                        key={index}
                        label={typeof tag === 'object' ? tag.name : tag}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>

                  {/* Author and Date */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                      {blog.author?.username?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="caption" color="text.secondary">
                      {blog.author?.username} • {formatDate(blog.created_at)}
                    </Typography>
                  </Box>

                  {/* Stats */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ViewIcon sx={{ fontSize: 16, mr: 0.5 }} />
                      <Typography variant="caption">
                        {blog.views_count}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FavoriteIcon sx={{ fontSize: 16, mr: 0.5 }} />
                      <Typography variant="caption">
                        {blog.likes_count}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Button
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/blog/${blog.slug}`);
                    }}
                  >
                    Read More
                  </Button>
                  
                  <Box>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(blog.id);
                      }}
                      color={blog.is_liked ? 'error' : 'default'}
                    >
                      {blog.is_liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </IconButton>
                    
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookmark(blog.id);
                      }}
                      color={blog.is_bookmarked ? 'primary' : 'default'}
                    >
                      {blog.is_bookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(event, value) => setCurrentPage(value)}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
};

export default HomePage;
