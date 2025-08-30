import React, { useState, useEffect } from 'react';
import { Save, X, Upload, Eye, EyeOff, Loader2, Plus, Minus } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useBlogContext } from '../contexts/BlogContext';

const BlogForm = ({ blog = null, onSave, onCancel }) => {
  const { 
    createBlog, 
    updateBlog, 
    categories, 
    tags, 
    fetchCategories, 
    fetchTags, 
    loading, 
    isDarkMode 
  } = useBlogContext();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: [],
    layout_type: 'minimal',
    featured_image: null,
    is_published: true
  });

  const [preview, setPreview] = useState(false);
  const [featuredImagePreview, setFeaturedImagePreview] = useState('');
  const [newTag, setNewTag] = useState('');
  const [availableTags, setAvailableTags] = useState([]);

  useEffect(() => {
    // Load categories and tags
    if (categories.length === 0) fetchCategories();
    if (tags.length === 0) fetchTags();
    
    // Set available tags
    setAvailableTags(tags);
  }, [tags, categories]);

  useEffect(() => {
    // If editing a blog, populate form with existing data
    if (blog) {
      setFormData({
        title: blog.title || '',
        content: blog.content || '',
        category: blog.category?.id || '',
        tags: blog.tags?.map(tag => tag.name) || [],
        layout_type: blog.layout_type || 'minimal',
        featured_image: null, // Don't pre-fill file input
        is_published: blog.is_published ?? true
      });
      
      if (blog.featured_image) {
        setFeaturedImagePreview(blog.featured_image);
      }
    }
  }, [blog]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleInputChange('featured_image', file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => setFeaturedImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleTagAdd = (tagName) => {
    if (tagName && !formData.tags.includes(tagName)) {
      handleInputChange('tags', [...formData.tags, tagName]);
      setNewTag('');
    }
  };

  const handleTagRemove = (tagName) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagName));
  };

  const handleNewTagAdd = () => {
    if (newTag.trim()) {
      handleTagAdd(newTag.trim());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let result;
      if (blog) {
        result = await updateBlog(blog.slug, formData);
      } else {
        result = await createBlog(formData);
      }
      
      if (onSave) {
        onSave(result);
      }
    } catch (error) {
      console.error('Failed to save blog:', error);
    }
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'link', 'image', 'video'
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {blog ? 'Edit Blog' : 'Create New Blog'}
            </h1>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setPreview(!preview)}
                className={`
                  flex items-center px-4 py-2 rounded-lg border transition-colors duration-200
                  ${isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                {preview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {preview ? 'Edit' : 'Preview'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className={`
                  flex items-center px-4 py-2 rounded-lg border transition-colors duration-200
                  ${isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`
                  flex items-center px-4 py-2 rounded-lg text-white transition-colors duration-200
                  ${loading 
                    ? (isDarkMode ? 'bg-gray-600' : 'bg-gray-400') 
                    : (isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600')
                  }
                `}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {blog ? 'Update' : 'Publish'}
              </button>
            </div>
          </div>

          {!preview ? (
            /* Edit Mode */
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter blog title..."
                  className={`
                    w-full px-4 py-3 rounded-lg border transition-colors duration-200
                    ${isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                    }
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20
                  `}
                />
              </div>

              {/* Category and Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className={`
                      w-full px-4 py-3 rounded-lg border transition-colors duration-200
                      ${isDarkMode 
                        ? 'bg-gray-800 border-gray-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                      }
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20
                    `}
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Layout Type
                  </label>
                  <select
                    value={formData.layout_type}
                    onChange={(e) => handleInputChange('layout_type', e.target.value)}
                    className={`
                      w-full px-4 py-3 rounded-lg border transition-colors duration-200
                      ${isDarkMode 
                        ? 'bg-gray-800 border-gray-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                      }
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20
                    `}
                  >
                    <option value="minimal">Minimal</option>
                    <option value="image-left">Image Left</option>
                    <option value="image-right">Image Right</option>
                    <option value="gallery">Gallery</option>
                  </select>
                </div>
              </div>

              {/* Featured Image */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Featured Image
                </label>
                <div className="space-y-4">
                  {featuredImagePreview && (
                    <div className="relative">
                      <img
                        src={featuredImagePreview}
                        alt="Featured"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFeaturedImagePreview('');
                          handleInputChange('featured_image', null);
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className={`
                      w-full px-4 py-3 rounded-lg border transition-colors duration-200
                      ${isDarkMode 
                        ? 'bg-gray-800 border-gray-700 text-white file:bg-gray-700 file:text-white file:border-gray-600' 
                        : 'bg-white border-gray-300 text-gray-900 file:bg-gray-50 file:text-gray-700 file:border-gray-200'
                      }
                      file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium
                    `}
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tags
                </label>
                
                {/* Selected Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`
                        inline-flex items-center px-3 py-1 rounded-full text-sm
                        ${isDarkMode ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800'}
                      `}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleTagRemove(tag)}
                        className="ml-2 text-current hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add New Tag */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add new tag..."
                    className={`
                      flex-1 px-3 py-2 rounded-lg border transition-colors duration-200
                      ${isDarkMode 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20
                    `}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleNewTagAdd();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleNewTagAdd}
                    className={`
                      px-3 py-2 rounded-lg border transition-colors duration-200
                      ${isDarkMode 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Available Tags */}
                <div className="flex flex-wrap gap-2">
                  {availableTags
                    .filter(tag => !formData.tags.includes(tag.name))
                    .slice(0, 10)
                    .map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleTagAdd(tag.name)}
                        className={`
                          px-3 py-1 rounded-full text-sm transition-colors duration-200
                          ${isDarkMode 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }
                        `}
                      >
                        {tag.name}
                      </button>
                    ))
                  }
                </div>
              </div>

              {/* Content Editor */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Content *
                </label>
                <div className={`${isDarkMode ? 'bg-gray-800 rounded-lg' : 'bg-white rounded-lg'}`}>
                  <ReactQuill
                    theme="snow"
                    value={formData.content}
                    onChange={(value) => handleInputChange('content', value)}
                    modules={quillModules}
                    formats={quillFormats}
                    className={isDarkMode ? 'dark-quill' : ''}
                    style={{ minHeight: '200px' }}
                  />
                </div>
              </div>

              {/* Publish Options */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => handleInputChange('is_published', e.target.checked)}
                  className="mr-3"
                />
                <label 
                  htmlFor="is_published" 
                  className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Publish immediately
                </label>
              </div>
            </div>
          ) : (
            /* Preview Mode */
            <div className={`
              prose lg:prose-xl mx-auto
              ${isDarkMode ? 'prose-invert' : ''}
            `}>
              <h1>{formData.title}</h1>
              {featuredImagePreview && (
                <img src={featuredImagePreview} alt="Featured" className="w-full rounded-lg" />
              )}
              <div dangerouslySetInnerHTML={{ __html: formData.content }} />
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default BlogForm;
