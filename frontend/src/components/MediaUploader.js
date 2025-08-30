import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Debug log to ensure component is loaded
console.log('MediaUploader component loaded');

const MediaUploader = ({ isDarkMode, onMediaUpload, blogId, mediaType = 'both' }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  const handleFileSelect = (files) => {
    if (!files || files.length === 0) return;
    
    const validFiles = [];
    const errors = [];
    
    for (let file of files) {
      // Validate file type
      if (mediaType === 'image' || mediaType === 'both') {
        if (file.type.startsWith('image/')) {
          validFiles.push({ file, type: 'image' });
          continue;
        }
      }
      
      if (mediaType === 'video' || mediaType === 'both') {
        if (file.type.startsWith('video/')) {
          validFiles.push({ file, type: 'video' });
          continue;
        }
      }
      
      errors.push(`Invalid file type: ${file.name}`);
    }
    
    if (errors.length > 0) {
      setUploadError(errors.join(', '));
      return;
    }
    
    uploadFiles(validFiles);
  };

  const uploadFiles = async (fileObjects) => {
    setUploading(true);
    setUploadError('');
    
    for (let fileObj of fileObjects) {
      try {
        const formData = new FormData();
        
        if (fileObj.type === 'image') {
          formData.append('image', fileObj.file);
          formData.append('caption', '');
          formData.append('order', '0');
          
          const response = await fetch(`http://localhost:8000/api/blogs/${blogId}/images/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            },
            body: formData,
          });
          
          if (!response.ok) {
            throw new Error('Failed to upload image');
          }
          
          const imageData = await response.json();
          onMediaUpload && onMediaUpload({ type: 'image', data: imageData });
          
        } else if (fileObj.type === 'video') {
          formData.append('video', fileObj.file);
          formData.append('caption', '');
          formData.append('order', '0');
          
          const response = await fetch(`http://localhost:8000/api/blogs/${blogId}/videos/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            },
            body: formData,
          });
          
          if (!response.ok) {
            throw new Error('Failed to upload video');
          }
          
          const videoData = await response.json();
          onMediaUpload && onMediaUpload({ type: 'video', data: videoData });
        }
      } catch (error) {
        console.error('Upload error:', error);
        setUploadError(error.message);
      }
    }
    
    setUploading(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileSelect(files);
  };

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    handleFileSelect(files);
  };

  if (!user || !blogId) return null;

  const getAcceptedFileTypes = () => {
    if (mediaType === 'image') return 'image/*';
    if (mediaType === 'video') return 'video/*';
    return 'image/*,video/*';
  };

  const getMediaTypeText = () => {
    if (mediaType === 'image') return 'images';
    if (mediaType === 'video') return 'videos';
    return 'images or videos';
  };

  return (
    <div className="mb-6">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 cursor-pointer ${
          dragOver
            ? isDarkMode
              ? 'border-blue-400 bg-blue-900/20'
              : 'border-blue-500 bg-blue-50'
            : isDarkMode
            ? 'border-gray-600 hover:border-gray-500'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={getAcceptedFileTypes()}
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        <div className={`text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {uploading ? (
            <>
              <i className="fas fa-spinner fa-spin text-2xl mb-2"></i>
              <p>Uploading media...</p>
            </>
          ) : (
            <>
              <i className="fas fa-cloud-upload-alt text-4xl mb-4 opacity-50"></i>
              <p className="text-lg font-medium mb-2">
                Drop {getMediaTypeText()} here or click to browse
              </p>
              <p className="text-sm opacity-75">
                Supports: {mediaType === 'image' ? 'JPG, PNG, GIF, WebP' : 
                          mediaType === 'video' ? 'MP4, WebM, MOV, AVI' : 
                          'Images (JPG, PNG, GIF, WebP) and Videos (MP4, WebM, MOV, AVI)'}
              </p>
            </>
          )}
        </div>
      </div>
      
      {uploadError && (
        <div className={`mt-2 p-3 rounded-lg ${isDarkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'}`}>
          <p className="text-sm">{uploadError}</p>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
