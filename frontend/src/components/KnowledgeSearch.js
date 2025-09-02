import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  List,
  ListItem,
  Chip,
  Paper,
  InputAdornment,
  Slider,
  FormControlLabel,
  Switch,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Article as ArticleIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';

import { ragApi, handleApiError } from '../services/ragApi';
import { useBlogContext } from '../contexts/BlogContext.js';

/**
 * Knowledge Base Search Component
 */
const KnowledgeSearch = () => {
  const [searchResults, setSearchResults] = useState(null);
  
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      query: '',
      k: 5,
      showDetails: false,
    },
  });

  const searchMutation = useMutation({
    mutationFn: ragApi.searchKnowledgeBase,
    onSuccess: (data) => {
      setSearchResults(data);
    },
  });

  const onSubmit = (data) => {
    const searchRequest = {
      query: data.query,
      k: data.k,
    };
    searchMutation.mutate(searchRequest);
  };

  const showDetails = watch('showDetails');

  const formatScore = (score) => {
    return (score * 100).toFixed(1) + '%';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'AI/ML': 'primary',
      'Web Development': 'secondary',
      'Programming': 'success',
      'Database': 'warning',
      'React': 'info',
      'Django': 'secondary',
    };
    return colors[category] || 'primary';
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Search Form Card */}
      <Card className="mb-6 shadow-lg">
        <CardContent>
          <div className="flex items-center mb-4">
            <SearchIcon className="mr-3 text-blue-600" />
            <Typography variant="h5" component="h1" className="font-bold">
              Knowledge Base Search
            </Typography>
          </div>
          
          <Typography variant="body2" color="text.secondary" className="mb-6">
            Search through the knowledge base to find relevant information and context for your blog topics.
          </Typography>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Controller
              name="query"
              control={control}
              rules={{ required: 'Search query is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Search Query"
                  placeholder="e.g., machine learning algorithms, web security, Python best practices"
                  error={!!errors.query}
                  helperText={errors.query?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  className="bg-white"
                />
              )}
            />

            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-full md:w-64">
                <Typography className="mb-2 font-medium">
                  Number of Results: {watch('k')}
                </Typography>
                <Controller
                  name="k"
                  control={control}
                  render={({ field }) => (
                    <Slider
                      {...field}
                      value={field.value}
                      onChange={(_, value) => field.onChange(value)}
                      min={1}
                      max={10}
                      marks
                      valueLabelDisplay="auto"
                      className="text-blue-600"
                    />
                  )}
                />
              </div>

              <Controller
                name="showDetails"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={field.onChange}
                        color="primary"
                      />
                    }
                    label="Show Details"
                    className="whitespace-nowrap"
                  />
                )}
              />
            </div>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={searchMutation.isPending}
              startIcon={searchMutation.isPending ? <CircularProgress size={20} /> : <SearchIcon />}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
            >
              {searchMutation.isPending ? 'Searching...' : 'Search Knowledge Base'}
            </Button>
          </Box>

          {searchMutation.error && (
            <Alert severity="error" className="mt-4">
              {handleApiError(searchMutation.error)}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults && (
        <Card className="shadow-lg">
          <CardContent>
            <Typography variant="h6" className="mb-2 font-semibold">
              Search Results for "{searchResults.query}"
            </Typography>
            
            <Typography variant="body2" color="text.secondary" className="mb-6">
              Found {searchResults.total_results} relevant documents
            </Typography>

            {searchResults.results.length === 0 ? (
              <Alert severity="info" className="text-center">
                No results found for your query. Try different keywords or broader terms.
              </Alert>
            ) : (
              <div className="space-y-4">
                {searchResults.results.map((result, index) => (
                  <div key={result.id || index}>
                    <Paper className="p-6 hover:shadow-md transition-shadow">
                      {/* Result Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <ArticleIcon color="primary" fontSize="small" />
                          <Typography variant="h6" component="h3" className="font-semibold">
                            {result.title}
                          </Typography>
                          <Chip
                            label={formatScore(result.similarity_score)}
                            size="small"
                            className="bg-green-100 text-green-800"
                          />
                          <Chip
                            label={`#${result.rank}`}
                            size="small"
                            variant="outlined"
                            className="border-gray-300"
                          />
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex gap-2 mb-4 flex-wrap">
                        <Chip
                          icon={<CategoryIcon />}
                          label={result.metadata?.category || 'Uncategorized'}
                          size="small"
                          color={getCategoryColor(result.metadata?.category)}
                          variant="outlined"
                        />
                        <Chip
                          icon={<PersonIcon />}
                          label={result.metadata?.author || 'Unknown'}
                          size="small"
                          variant="outlined"
                          className="border-gray-300"
                        />
                        <Chip
                          icon={<CalendarIcon />}
                          label={result.metadata?.date || 'No date'}
                          size="small"
                          variant="outlined"
                          className="border-gray-300"
                        />
                      </div>

                      {/* Content Preview */}
                      <Paper className="p-4 bg-gray-50 border border-gray-200">
                        <Typography variant="body2" className="leading-relaxed">
                          {result.chunk && result.chunk.length > 400 
                            ? `${result.chunk.substring(0, 400)}...`
                            : result.chunk || 'No content available'
                          }
                        </Typography>
                      </Paper>

                      {/* Additional Details */}
                      {showDetails && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                            <div>
                              <span className="font-semibold">Chunk:</span> {(result.chunk_index || 0) + 1} of {result.total_chunks || 1}
                            </div>
                            <div>
                              <span className="font-semibold">Document ID:</span> {result.id || 'N/A'}
                            </div>
                            <div>
                              <span className="font-semibold">Similarity Score:</span> {result.similarity_score?.toFixed(4) || 'N/A'}
                            </div>
                          </div>
                        </div>
                      )}
                    </Paper>
                    
                    {index < searchResults.results.length - 1 && (
                      <Divider className="my-4" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!searchResults && !searchMutation.isPending && (
        <Card className="shadow-lg">
          <CardContent>
            <div className="text-center p-12">
              <SearchIcon className="text-8xl text-gray-300 mb-4" />
              <Typography variant="h6" color="text.secondary" className="mb-2">
                Search the Knowledge Base
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter a search query above to find relevant documents and information
              </Typography>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default KnowledgeSearch;
