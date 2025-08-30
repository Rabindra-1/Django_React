import React, { useState, useRef } from 'react';
import { Eye, Copy, Trash2, Lightbulb, Loader2, Upload } from 'lucide-react';
import { aiAPI } from '../services/api';
import { useBlogContext } from '../contexts/BlogContext';

const ImageAnalyzer = () => {
  const { isDarkMode } = useBlogContext();
  const [selectedImage, setSelectedImage] = useState(null);
  const [analysisType, setAnalysisType] = useState('description');
  const [analyzedResult, setAnalyzedResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, GIF, BMP, WebP)');
        return;
      }
      
      // Validate file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Please select an image smaller than 10MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage({
          file: file,
          preview: reader.result,
          name: file.name
        });
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleAnalyzeImage = async (e) => {
    e.preventDefault();
    
    if (!selectedImage) {
      setError('Please select an image to analyze');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await aiAPI.analyzeImage(selectedImage.file, analysisType);
      setAnalyzedResult({
        text: response.data.generated_text,
        analysisType: analysisType,
        imageUrl: response.data.image_url,
        id: response.data.id,
        processingTime: response.data.processing_time
      });
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError(err.response?.data?.error || 'Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = () => {
    if (analyzedResult?.text) {
      navigator.clipboard.writeText(analyzedResult.text)
        .then(() => alert('Analysis text copied to clipboard!'))
        .catch(() => alert('Failed to copy text'));
    }
  };

  const handleClear = () => {
    setSelectedImage(null);
    setAnalyzedResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const analysisOptions = [
    { value: 'description', label: 'General Description', description: 'Overall description of the image' },
    { value: 'detailed', label: 'Detailed Analysis', description: 'Comprehensive analysis with details' },
    { value: 'caption', label: 'Social Media Caption', description: 'Engaging caption for posts' },
    { value: 'ocr', label: 'Text Extraction', description: 'Extract text from the image (OCR)' }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          AI Image Analyzer
        </h1>
        <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Upload images and get AI-powered descriptions, captions, and text extraction
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
          <h3 className={`text-xl font-semibold mb-4 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Upload className="w-5 h-5 mr-2" />
            Upload & Analyze Image
          </h3>

          <form onSubmit={handleAnalyzeImage} className="space-y-4">
            {/* Image Upload */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Select Image
              </label>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
                isDarkMode 
                  ? 'border-gray-600 hover:border-gray-500' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className={`cursor-pointer flex flex-col items-center space-y-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  <Upload className="w-12 h-12 opacity-50" />
                  <span className="font-medium">Click to upload an image</span>
                  <span className="text-xs opacity-75">
                    Supports JPEG, PNG, GIF, BMP, WebP (max 10MB)
                  </span>
                </label>
              </div>
            </div>

            {/* Selected Image Preview */}
            {selectedImage && (
              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <img
                    src={selectedImage.preview}
                    alt="Selected"
                    className="w-full h-48 object-contain rounded-lg"
                  />
                  <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {selectedImage.name}
                  </p>
                </div>
              </div>
            )}

            {/* Analysis Type Selection */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Analysis Type
              </label>
              <div className="grid grid-cols-1 gap-2">
                {analysisOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setAnalysisType(option.value)}
                    className={`p-3 rounded-lg border text-left transition-colors duration-200 ${
                      analysisType === option.value
                        ? (isDarkMode ? 'border-blue-500 bg-blue-900' : 'border-blue-500 bg-blue-50')
                        : (isDarkMode ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 bg-white hover:bg-gray-50')
                    }`}
                  >
                    <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {option.label}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {option.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Analyze Button */}
            <button
              type="submit"
              disabled={loading || !selectedImage}
              className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-colors duration-200 ${
                loading || !selectedImage
                  ? (isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-400 text-gray-200')
                  : (isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white')
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Eye className="w-5 h-5 mr-2" />
                  Analyze Image
                </>
              )}
            </button>
          </form>

          {/* Error Display */}
          {error && (
            <div className={`mt-4 p-3 rounded-lg border ${
              isDarkMode ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
          <h3 className={`text-xl font-semibold mb-4 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Eye className="w-5 h-5 mr-2" />
            Analysis Results
          </h3>

          <div className={`min-h-64 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4`}>
            {analyzedResult ? (
              <div className="space-y-4">
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    Analysis Type: {analysisOptions.find(opt => opt.value === analyzedResult.analysisType)?.label}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Processing time: {analyzedResult.processingTime?.toFixed(2)}s
                  </p>
                </div>
                <div className={`whitespace-pre-wrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                  {analyzedResult.text}
                </div>
              </div>
            ) : (
              <div className={`h-full flex flex-col items-center justify-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <Eye className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-center">Your image analysis will appear here...</p>
                <p className="text-xs mt-2 opacity-75 text-center">Upload an image and click "Analyze Image" to get started</p>
              </div>
            )}
          </div>

          {/* Result Actions */}
          {analyzedResult && (
            <div className="mt-4 flex space-x-2">
              <button
                onClick={handleCopyText}
                className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isDarkMode 
                    ? 'bg-blue-900 text-blue-300 hover:bg-blue-800' 
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Text
              </button>
              
              <button
                onClick={handleClear}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isDarkMode 
                    ? 'bg-red-900 text-red-300 hover:bg-red-800' 
                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                }`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Usage Tips */}
      <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h4 className={`text-lg font-semibold mb-3 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <Lightbulb className="w-5 h-5 mr-2 text-blue-500" />
          Tips for Better Analysis:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <li><strong>High quality images:</strong> Use clear, well-lit photos for better descriptions</li>
            <li><strong>Text extraction:</strong> Ensure text is readable and not too small or blurry</li>
            <li><strong>File formats:</strong> JPEG and PNG work best for analysis</li>
          </ul>
          <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <li><strong>Description vs Caption:</strong> Use description for detailed analysis, caption for social media</li>
            <li><strong>OCR accuracy:</strong> Works best with clear, high-contrast text</li>
            <li><strong>Processing time:</strong> Larger images may take longer to analyze</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageAnalyzer;
