import React, { useState } from 'react';

const VideoToBlogConverter = ({ isDarkMode }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check if file is video or audio
      const validTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'audio/mp3', 'audio/wav', 'audio/m4a'];
      if (validTypes.includes(file.type)) {
        setSelectedFile(file);
        setError('');
      } else {
        setError('Please select a valid video or audio file (MP4, AVI, MOV, WMV, MP3, WAV, M4A)');
        setSelectedFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Replace with your actual backend endpoint
      const response = await fetch('/api/process-video/', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setExtractedText(data.transcription || data.text || 'No text extracted');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to process video');
      }
    } catch (err) {
      setError('Network error: Unable to process video');
      console.error('Upload error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setExtractedText('');
    setError('');
  };

  return (
    <div>
      <h1 className={`text-4xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Video to Blog Converter
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6 transition-colors duration-300`}>
          <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Upload Video/Audio File
          </h3>
          
          <div className="space-y-4">
            <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
              isDarkMode 
                ? 'border-gray-600 hover:border-gray-500' 
                : 'border-gray-300 hover:border-gray-400'
            }`}>
              <input
                type="file"
                id="video-upload"
                accept="video/*,audio/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="video-upload"
                className={`cursor-pointer flex flex-col items-center space-y-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                <i className="fas fa-cloud-upload-alt text-3xl"></i>
                <span className="text-sm">Click to upload video or audio file</span>
                <span className="text-xs opacity-75">
                  Supports MP4, AVI, MOV, WMV, MP3, WAV, M4A
                </span>
              </label>
            </div>

            {selectedFile && (
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-file-video text-blue-500"></i>
                    <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedFile.name}
                    </span>
                  </div>
                  <button
                    onClick={clearFile}
                    className={`text-red-500 hover:text-red-700 transition-colors duration-200`}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
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
              disabled={!selectedFile || isProcessing}
              className={`w-full px-6 py-3 rounded-lg font-medium transition-colors duration-200 cursor-pointer whitespace-nowrap ${
                !selectedFile || isProcessing
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {isProcessing ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Processing...
                </>
              ) : (
                <>
                  <i className="fas fa-magic mr-2"></i>
                  Convert to Blog Text
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
            placeholder="Extracted text from your video/audio will appear here..."
            className={`w-full h-64 px-4 py-3 rounded-lg border transition-colors duration-200 text-sm resize-none ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-purple-500`}
          />
          
          {extractedText && (
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => navigator.clipboard.writeText(extractedText)}
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
        </div>
      </div>
    </div>
  );
};

export default VideoToBlogConverter;
