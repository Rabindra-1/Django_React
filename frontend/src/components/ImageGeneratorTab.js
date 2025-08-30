import React, { useState } from 'react';
import { Image, Wand2, Download, Copy, Trash2, Lightbulb, Loader2 } from 'lucide-react';
import { aiAPI } from '../services/api';
import { useBlogContext } from '../contexts/BlogContext';

const ImageGeneratorTab = () => {
  const { isDarkMode } = useBlogContext();
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateImage = async (e) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Please enter a prompt for image generation');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await aiAPI.generateImage(prompt, style);
      setGeneratedImage({
        url: response.data.image_url,
        prompt: prompt,
        style: style,
        id: response.data.id
      });
    } catch (err) {
      console.error('Error generating image:', err);
      setError(err.response?.data?.error || 'Failed to generate image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadImage = async () => {
    if (generatedImage?.url) {
      try {
        const response = await fetch(generatedImage.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ai-generated-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Failed to download image:', err);
        alert('Failed to download image');
      }
    }
  };

  const handleCopyImageUrl = () => {
    if (generatedImage?.url) {
      navigator.clipboard.writeText(generatedImage.url)
        .then(() => alert('Image URL copied to clipboard!'))
        .catch(() => alert('Failed to copy image URL'));
    }
  };

  const handleClear = () => {
    setGeneratedImage(null);
    setPrompt('');
    setError(null);
  };

  const samplePrompts = [
    "A serene mountain landscape at sunset",
    "A futuristic city with flying cars",
    "A cozy coffee shop in autumn",
    "A majestic lion in the African savanna",
    "Abstract geometric patterns in vibrant colors",
    "A vintage bicycle on a cobblestone street"
  ];

  const styleOptions = [
    { value: 'realistic', label: 'Realistic', description: 'Photorealistic images' },
    { value: 'artistic', label: 'Artistic', description: 'Creative and stylized' },
    { value: 'cartoon', label: 'Cartoon', description: 'Cartoon-style illustrations' },
    { value: 'abstract', label: 'Abstract', description: 'Abstract art style' }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          AI Image Generator
        </h1>
        <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Create stunning images from text descriptions using AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
          <h3 className={`text-xl font-semibold mb-4 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Wand2 className="w-5 h-5 mr-2" />
            Generate Image
          </h3>

          <form onSubmit={handleGenerateImage} className="space-y-4">
            {/* Prompt Input */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Image Description
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to generate... (e.g., 'A peaceful beach at sunset with palm trees')"
                className={`w-full h-32 px-4 py-3 rounded-lg border transition-colors duration-200 resize-none ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
                required
              />
            </div>

            {/* Style Selection */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Art Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {styleOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setStyle(option.value)}
                    className={`p-3 rounded-lg border text-left transition-colors duration-200 ${
                      style === option.value
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

            {/* Generate Button */}
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-colors duration-200 ${
                loading || !prompt.trim()
                  ? (isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-400 text-gray-200')
                  : (isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white')
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Image className="w-5 h-5 mr-2" />
                  Generate Image
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

          {/* Sample Prompts */}
          <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h4 className={`text-sm font-medium mb-3 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
              Sample Prompts:
            </h4>
            <div className="space-y-2">
              {samplePrompts.map((samplePrompt, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(samplePrompt)}
                  className={`block w-full text-left text-xs p-2 rounded border transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-600' 
                      : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  "{samplePrompt}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
          <h3 className={`text-xl font-semibold mb-4 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Image className="w-5 h-5 mr-2" />
            Generated Image
          </h3>

          <div className={`aspect-square rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            {generatedImage ? (
              <img
                src={generatedImage.url}
                alt={generatedImage.prompt}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full flex flex-col items-center justify-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <Image className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-center">Your generated image will appear here...</p>
                <p className="text-xs mt-2 opacity-75 text-center">Enter a description and click "Generate Image" to get started</p>
              </div>
            )}
          </div>

          {/* Image Actions */}
          {generatedImage && (
            <div className="mt-4 space-y-3">
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Prompt: {generatedImage.prompt}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Style: {generatedImage.style}
                </p>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleDownloadImage}
                  className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isDarkMode 
                      ? 'bg-green-900 text-green-300 hover:bg-green-800' 
                      : 'bg-green-50 text-green-600 hover:bg-green-100'
                  }`}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
                
                <button
                  onClick={handleCopyImageUrl}
                  className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isDarkMode 
                      ? 'bg-blue-900 text-blue-300 hover:bg-blue-800' 
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy URL
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
            </div>
          )}
        </div>
      </div>

      {/* Usage Tips */}
      <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h4 className={`text-lg font-semibold mb-3 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <Lightbulb className="w-5 h-5 mr-2 text-blue-500" />
          Tips for Better Images:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <li><strong>Be descriptive:</strong> Include details about colors, lighting, and composition</li>
            <li><strong>Specify mood:</strong> Words like "peaceful", "dramatic", or "vibrant" help set the tone</li>
            <li><strong>Add context:</strong> Mention time of day, weather, or setting</li>
          </ul>
          <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <li><strong>Choose the right style:</strong> Realistic for photos, artistic for creative interpretations</li>
            <li><strong>Use artistic terms:</strong> "Oil painting", "watercolor", "digital art" can influence style</li>
            <li><strong>Iterate and refine:</strong> Try variations of your prompt for different results</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageGeneratorTab;
