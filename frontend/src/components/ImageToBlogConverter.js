import React, { useState } from 'react';

const ImageToBlogConverter = ({ isDarkMode }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [error, setError] = useState('');
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = [];
    const newPreviewUrls = [];
    
    files.forEach(file => {
      // Check if file is image
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
      if (validTypes.includes(file.type)) {
        validFiles.push(file);
        // Create preview URL
        const url = URL.createObjectURL(file);
        newPreviewUrls.push(url);
      }
    });

    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
      setPreviewUrls(newPreviewUrls);
      setError('');
    } else {
      setError('Please select valid image files (JPEG, PNG, GIF, BMP, WebP)');
      setSelectedFiles([]);
      setPreviewUrls([]);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one image file');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const formData = new FormData();
      selectedFiles.forEach((file, index) => {
        formData.append(`images`, file);
      });

      // Replace with your actual backend endpoint
      const response = await fetch('/api/process-images/', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setExtractedText(data.extracted_text || data.text || 'No text extracted from images');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to process images');
      }
    } catch (err) {
      setError('Network error: Unable to process images');
      console.error('Upload error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newUrls);
    
    if (newFiles.length === 0) {
      setExtractedText('');
      setError('');
    }
  };

  const clearAll = () => {
    // Revoke all URLs to prevent memory leaks
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    
    setSelectedFiles([]);
    setPreviewUrls([]);
    setExtractedText('');
    setError('');
  };

  return (
    <div>
      <h1 className={`text-4xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Image to Blog Converter
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6 transition-colors duration-300`}>
          <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Upload Image Files
          </h3>
          
          <div className="space-y-4">
            <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
              isDarkMode 
                ? 'border-gray-600 hover:border-gray-500' 
                : 'border-gray-300 hover:border-gray-400'
            }`}>
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="image-upload"
                className={`cursor-pointer flex flex-col items-center space-y-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                <i className="fas fa-images text-3xl"></i>
                <span className="text-sm">Click to upload image files</span>
                <span className="text-xs opacity-75">
                  Supports JPEG, PNG, GIF, BMP, WebP (multiple files allowed)
                </span>
              </label>
            </div>

            {/* Image Previews */}
            {selectedFiles.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Selected Images ({selectedFiles.length})
                  </span>
                  <button
                    onClick={clearAll}
                    className="text-red-500 hover:text-red-700 text-sm transition-colors duration-200 cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                      >
                        ×
                      </button>
                      <div className={`absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg truncate`}>
                        {selectedFiles[index].name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || isProcessing}
              className={`w-full px-6 py-3 rounded-lg font-medium transition-colors duration-200 whitespace-nowrap ${
                selectedFiles.length === 0 || isProcessing
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
              }`}
            >
              {isProcessing ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Processing Images...
                </>
              ) : (
                <>
                  <i className="fas fa-magic mr-2"></i>
                  Extract Text from Images
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Section */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6 transition-colors duration-300`}>
          <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Extracted Blog Content
          </h3>
          
          <textarea
            value={extractedText}
            onChange={(e) => setExtractedText(e.target.value)}
            placeholder="Extracted text from your images will appear here..."
            className={`w-full h-64 px-4 py-3 rounded-lg border transition-colors duration-200 text-sm resize-none ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-green-500`}
          />
          
          {extractedText && (
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(extractedText)
                    .then(() => alert('Text copied to clipboard!'))
                    .catch(() => alert('Failed to copy text'));
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer whitespace-nowrap ${
                  isDarkMode 
                    ? 'bg-blue-900 text-blue-300 hover:bg-blue-800' 
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                <i className="fas fa-copy mr-2"></i>
                Copy Text
              </button>
              <button
                onClick={() => setExtractedText('')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer whitespace-nowrap ${
                  isDarkMode 
                    ? 'bg-red-900 text-red-300 hover:bg-red-800' 
                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                }`}
              >
                <i className="fas fa-trash mr-2"></i>
                Clear
              </button>
            </div>
          )}

          {/* Processing Tips */}
          <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <i className="fas fa-lightbulb mr-2 text-yellow-500"></i>
              Tips for better results:
            </h4>
            <ul className={`text-xs space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>• Use high-quality, clear images with readable text</li>
              <li>• Ensure good contrast between text and background</li>
              <li>• Avoid blurry or heavily compressed images</li>
              <li>• Screenshots of documents work well</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageToBlogConverter;
