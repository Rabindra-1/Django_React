import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image, Video, Camera } from 'lucide-react';
import { useBlogContext } from '../contexts/BlogContext';

const MediaUpload = ({ 
  onFileSelect, 
  acceptedTypes = 'image/*,video/*', 
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB default
  preview = true,
  className = '',
  label = 'Upload Media'
}) => {
  const { isDarkMode } = useBlogContext();
  const [isDragOver, setIsDragOver] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`;
    }
    
    const acceptedTypesArray = acceptedTypes.split(',').map(type => type.trim());
    const isValidType = acceptedTypesArray.some(type => {
      if (type.includes('*')) {
        const baseType = type.split('/')[0];
        return file.type.startsWith(baseType);
      }
      return file.type === type;
    });
    
    if (!isValidType) {
      return `Invalid file type. Accepted types: ${acceptedTypes}`;
    }
    
    return null;
  };

  const processFiles = (files) => {
    const fileList = Array.from(files);
    let validFiles = [];
    let errorMessages = [];

    fileList.forEach(file => {
      const validationError = validateFile(file);
      if (validationError) {
        errorMessages.push(`${file.name}: ${validationError}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errorMessages.length > 0) {
      setError(errorMessages.join(', '));
      return;
    }

    setError('');

    if (preview) {
      const newPreviews = validFiles.map(file => ({
        file,
        url: URL.createObjectURL(file),
        type: file.type.split('/')[0],
        name: file.name
      }));

      if (multiple) {
        setPreviews(prev => [...prev, ...newPreviews]);
      } else {
        // Clean up previous URL
        previews.forEach(preview => URL.revokeObjectURL(preview.url));
        setPreviews(newPreviews);
      }
    }

    if (multiple) {
      onFileSelect([...previews.map(p => p.file), ...validFiles]);
    } else {
      onFileSelect(validFiles[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const removePreview = (index) => {
    const updatedPreviews = previews.filter((_, i) => i !== index);
    URL.revokeObjectURL(previews[index].url);
    setPreviews(updatedPreviews);
    
    if (multiple) {
      onFileSelect(updatedPreviews.map(p => p.file));
    } else {
      onFileSelect(null);
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'image':
        return <Image className="w-8 h-8" />;
      case 'video':
        return <Video className="w-8 h-8" />;
      default:
        return <FileText className="w-8 h-8" />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 cursor-pointer
          ${isDragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}
          ${isDarkMode ? 'border-gray-600 bg-gray-800 hover:bg-gray-700' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={acceptedTypes}
          multiple={multiple}
          onChange={handleFileSelect}
        />
        
        <div className="text-center">
          <Upload className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {label}
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Drag and drop files here or click to browse
          </p>
          <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Max size: {Math.round(maxSize / (1024 * 1024))}MB
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-red-900/50 border border-red-700' : 'bg-red-50 border border-red-200'}`}>
          <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>{error}</p>
        </div>
      )}

      {/* Preview Area */}
      {preview && previews.length > 0 && (
        <div className="space-y-3">
          <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {multiple ? 'Selected Files:' : 'Selected File:'}
          </h4>
          <div className={`grid gap-3 ${multiple ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {previews.map((previewItem, index) => (
              <div
                key={index}
                className={`relative group rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-200'}`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removePreview(index);
                  }}
                  className="absolute top-2 right-2 z-10 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <X className="w-4 h-4" />
                </button>

                {previewItem.type === 'image' ? (
                  <div className="aspect-video">
                    <img
                      src={previewItem.url}
                      alt={previewItem.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : previewItem.type === 'video' ? (
                  <div className="aspect-video">
                    <video
                      src={previewItem.url}
                      className="w-full h-full object-cover"
                      controls
                    />
                  </div>
                ) : (
                  <div className={`aspect-video flex items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    {getFileIcon(previewItem.type)}
                  </div>
                )}

                <div className="p-3">
                  <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {previewItem.name}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {(previewItem.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUpload;
