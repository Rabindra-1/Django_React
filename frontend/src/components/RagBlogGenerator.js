import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Grid,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Create as CreateIcon,
  Search as SearchIcon,
  AutoAwesome as AutoAwesomeIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';

import { ragApi, handleApiError } from '../services/ragApi';
import { useBlogContext } from '../contexts/BlogContext.js';
import KnowledgeSearch from './KnowledgeSearch';

/**
 * Tab panel component for organizing content
 */
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`rag-tabpanel-${index}`}
      aria-labelledby={`rag-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

/**
 * Main RAG Blog Generator Component
 */
const RagBlogGenerator = () => {
  const [activeTab, setActiveTab] = useState(0);
  const queryClient = useQueryClient();

  // Fetch system status and config
  const { 
    data: status, 
    isLoading: statusLoading 
  } = useQuery({
    queryKey: ['rag-status'],
    queryFn: ragApi.getStatus,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { 
    data: config, 
    isLoading: configLoading 
  } = useQuery({
    queryKey: ['rag-config'],
    queryFn: ragApi.getConfig,
  });

  // Form for blog generation
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      topic: '',
      style: 'informative',
      length: 'medium',
      target_audience: 'general',
      num_context_docs: 3,
    },
  });

  // Blog generation mutation
  const generateBlogMutation = useMutation({
    mutationFn: ragApi.generateBlogPost,
    onSuccess: (data) => {
      queryClient.setQueryData(['generated-blog'], data);
    },
  });

  // Outline generation mutation
  const generateOutlineMutation = useMutation({
    mutationFn: ragApi.generateOutline,
    onSuccess: (data) => {
      queryClient.setQueryData(['generated-outline'], data);
    },
  });

  const onSubmit = (data) => {
    generateBlogMutation.mutate(data);
  };

  const handleGenerateOutline = () => {
    const topic = watch('topic');
    const numContextDocs = watch('num_context_docs');
    
    if (topic) {
      generateOutlineMutation.mutate({
        topic,
        num_context_docs: numContextDocs,
      });
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (statusLoading || configLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading RAG system...</Typography>
      </Box>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      {/* System Status Card */}
      <Card className="mb-6 shadow-lg">
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <AutoAwesomeIcon color="primary" />
            <Typography variant="h4" component="h1" className="font-bold">
              RAG Blog Generator
            </Typography>
            {status?.using_mock_generator && (
              <Chip
                label="Demo Mode"
                color="warning"
                size="small"
                icon={<InfoIcon />}
              />
            )}
            {status?.is_ready && (
              <Chip
                label="Ready"
                color="success"
                size="small"
              />
            )}
          </Box>
          
          {!status?.is_ready && (
            <Alert severity="error" className="mb-4">
              RAG system is not ready. Please check the backend server.
            </Alert>
          )}

          {status?.using_mock_generator && (
            <Alert severity="info" className="mb-4">
              Running in demo mode. Set MISTRAL_API_KEY for full functionality.
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <Paper className="p-4 text-center bg-blue-50">
              <Typography variant="caption" color="text.secondary">
                Documents
              </Typography>
              <Typography variant="h5" className="font-bold text-blue-600">
                {status?.num_documents || 0}
              </Typography>
            </Paper>
            <Paper className="p-4 text-center bg-green-50">
              <Typography variant="caption" color="text.secondary">
                Model
              </Typography>
              <Typography variant="body1" className="font-semibold text-green-600">
                {status?.sentence_model || 'N/A'}
              </Typography>
            </Paper>
            <Paper className="p-4 text-center bg-purple-50">
              <Typography variant="caption" color="text.secondary">
                Status
              </Typography>
              <Typography variant="body1" className="font-semibold text-purple-600">
                {status?.is_ready ? 'Ready' : 'Initializing'}
              </Typography>
            </Paper>
            <Paper className="p-4 text-center bg-orange-50">
              <Typography variant="caption" color="text.secondary">
                Mode
              </Typography>
              <Typography variant="body1" className="font-semibold text-orange-600">
                {status?.using_mock_generator ? 'Demo' : 'Production'}
              </Typography>
            </Paper>
          </div>
        </CardContent>
      </Card>

      {/* Main Interface */}
      <Card className="shadow-lg">
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="RAG blog tabs">
            <Tab label="Generate Blog" icon={<CreateIcon />} />
            <Tab label="Search Knowledge" icon={<SearchIcon />} />
          </Tabs>
        </Box>

        {/* Generate Blog Tab */}
        <TabPanel value={activeTab} index={0}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Configuration Panel */}
            <div>
              <Typography variant="h6" className="mb-4 font-semibold">
                Blog Configuration
              </Typography>
              
              <Box component="form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Controller
                  name="topic"
                  control={control}
                  rules={{ required: 'Topic is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Blog Topic"
                      placeholder="e.g., Machine Learning for Beginners"
                      error={!!errors.topic}
                      helperText={errors.topic?.message}
                      className="bg-white"
                    />
                  )}
                />

                <Controller
                  name="style"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth className="bg-white">
                      <InputLabel>Writing Style</InputLabel>
                      <Select {...field} label="Writing Style">
                        {config?.styles?.map((style) => (
                          <MenuItem key={style} value={style}>
                            {style.charAt(0).toUpperCase() + style.slice(1)}
                          </MenuItem>
                        )) || []}
                      </Select>
                    </FormControl>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="length"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth className="bg-white">
                        <InputLabel>Length</InputLabel>
                        <Select {...field} label="Length">
                          {config?.lengths?.map((length) => (
                            <MenuItem key={length} value={length}>
                              {length.charAt(0).toUpperCase() + length.slice(1)}
                            </MenuItem>
                          )) || []}
                        </Select>
                      </FormControl>
                    )}
                  />
                  
                  <Controller
                    name="target_audience"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth className="bg-white">
                        <InputLabel>Audience</InputLabel>
                        <Select {...field} label="Audience">
                          {config?.audiences?.map((audience) => (
                            <MenuItem key={audience} value={audience}>
                              {audience.charAt(0).toUpperCase() + audience.slice(1)}
                            </MenuItem>
                          )) || []}
                        </Select>
                      </FormControl>
                    )}
                  />
                </div>

                <Controller
                  name="num_context_docs"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Context Documents"
                      inputProps={{ min: 1, max: 10 }}
                      helperText="Number of documents to use for context"
                      className="bg-white"
                    />
                  )}
                />

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={handleGenerateOutline}
                    disabled={!watch('topic') || generateOutlineMutation.isPending}
                    startIcon={generateOutlineMutation.isPending ? <CircularProgress size={20} /> : undefined}
                    className="flex-1"
                  >
                    Generate Outline
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={generateBlogMutation.isPending || !status?.is_ready}
                    startIcon={generateBlogMutation.isPending ? <CircularProgress size={20} /> : undefined}
                    className="flex-1"
                  >
                    Generate Blog Post
                  </Button>
                </div>
              </Box>
            </div>

            {/* Generated Content Panel */}
            <div>
              <Typography variant="h6" className="mb-4 font-semibold">
                Generated Content
              </Typography>

              {/* Error Display */}
              {(generateBlogMutation.error || generateOutlineMutation.error) && (
                <Alert severity="error" className="mb-4">
                  {handleApiError(generateBlogMutation.error || generateOutlineMutation.error)}
                </Alert>
              )}

              {/* Loading State */}
              {(generateBlogMutation.isPending || generateOutlineMutation.isPending) && (
                <div className="flex items-center justify-center p-8">
                  <CircularProgress />
                  <Typography className="ml-4">
                    {generateBlogMutation.isPending ? 'Generating blog post...' : 'Creating outline...'}
                  </Typography>
                </div>
              )}

              {/* Outline Display */}
              {generateOutlineMutation.data && (
                <Accordion className="mb-4 shadow-sm">
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} className="bg-blue-50">
                    <Typography variant="subtitle1" className="font-semibold">
                      📝 Blog Outline: {generateOutlineMutation.data.topic}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <div className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded">
                      {generateOutlineMutation.data.outline}
                    </div>
                  </AccordionDetails>
                </Accordion>
              )}

              {/* Blog Post Display */}
              {generateBlogMutation.data && (
                <div className="space-y-4">
                  {/* Metadata Chips */}
                  <div className="flex gap-2 flex-wrap">
                    <Chip
                      label={`Style: ${generateBlogMutation.data.style}`}
                      size="small"
                      variant="outlined"
                      className="bg-blue-100"
                    />
                    <Chip
                      label={`Length: ${generateBlogMutation.data.length}`}
                      size="small"
                      variant="outlined"
                      className="bg-green-100"
                    />
                    <Chip
                      label={generateBlogMutation.data.using_mock ? 'Demo' : 'AI Generated'}
                      size="small"
                      color={generateBlogMutation.data.using_mock ? 'warning' : 'success'}
                    />
                  </div>

                  {/* Generated Content */}
                  <Paper className="p-6 max-h-96 overflow-auto custom-scrollbar shadow-sm">
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {generateBlogMutation.data.content}
                    </div>
                  </Paper>

                  {/* Context Information */}
                  <Accordion className="shadow-sm">
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} className="bg-gray-50">
                      <Typography variant="subtitle2" className="font-semibold">
                        📚 Context Information ({generateBlogMutation.data.retrieved_docs?.length || 0} docs)
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <div className="space-y-3">
                        {generateBlogMutation.data.retrieved_docs?.map((doc, index) => (
                          <Paper key={index} className="p-4 bg-gray-50">
                            <Typography variant="subtitle2" className="font-semibold mb-2">
                              {doc.title} (Score: {doc.similarity_score?.toFixed(3) || 'N/A'})
                            </Typography>
                            <Typography variant="body2" color="text.secondary" className="text-sm">
                              {doc.chunk?.substring(0, 200) || 'No content available'}...
                            </Typography>
                            <div className="flex gap-2 mt-2">
                              <Chip 
                                label={doc.metadata?.category || 'Uncategorized'} 
                                size="small" 
                                variant="outlined"
                                className="text-xs"
                              />
                              <Chip 
                                label={doc.metadata?.author || 'Unknown'} 
                                size="small" 
                                variant="outlined"
                                className="text-xs"
                              />
                            </div>
                          </Paper>
                        )) || []}
                      </div>
                    </AccordionDetails>
                  </Accordion>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <Button
                      variant="outlined"
                      onClick={() => navigator.clipboard?.writeText(generateBlogMutation.data.content)}
                      className="flex-1"
                    >
                      Copy Content
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => reset()}
                      className="flex-1"
                    >
                      New Post
                    </Button>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!generateBlogMutation.data && !generateOutlineMutation.data && !generateBlogMutation.isPending && !generateOutlineMutation.isPending && (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <AutoAwesomeIcon className="text-6xl text-gray-400 mb-4" />
                  <Typography variant="h6" color="text.secondary" className="mb-2">
                    Ready to generate content
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Enter a topic and click "Generate Blog Post" to get started
                  </Typography>
                </div>
              )}
            </div>
          </div>
        </TabPanel>

        {/* Search Tab */}
        <TabPanel value={activeTab} index={1}>
          <KnowledgeSearch />
        </TabPanel>
      </Card>
    </div>
  );
};

export default RagBlogGenerator;
