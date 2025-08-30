import React, { useState } from 'react';

const MediaDisplay = ({ images = [], videos = [], isDarkMode, isOwner = false, onDeleteMedia }) => {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const openMediaModal = (media, type) => {
    setSelectedMedia({ ...media, mediaType: type });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMedia(null);
  };

  const handleDeleteMedia = async (mediaId, type) => {
    if (!isOwner) return;
    
    const confirmDelete = window.confirm(`Are you sure you want to delete this ${type}?`);
    if (!confirmDelete) return;
    
    try {
      const endpoint = type === 'image' 
        ? `http://localhost:8000/api/blogs/images/${mediaId}/`
        : `http://localhost:8000/api/blogs/videos/${mediaId}/`;
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (response.ok) {
        onDeleteMedia && onDeleteMedia(mediaId, type);
      } else {
        throw new Error(`Failed to delete ${type}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert(`Failed to delete ${type}. Please try again.`);
    }
  };

  const hasMedia = images.length > 0 || videos.length > 0;

  if (!hasMedia) return null;

  return (
    <>
      <div className="mb-8">
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Media Gallery
        </h3>
        
        {/* Images Grid */}
        {images.length > 0 && (
          <div className="mb-6">
            <h4 className={`text-md font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Images
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <div
                    className="aspect-square bg-cover bg-center rounded-lg cursor-pointer transition-transform duration-300 hover:scale-105 shadow-md hover:shadow-lg"
                    style={{
                      backgroundImage: `url(http://localhost:8000${image.image})`,
                    }}
                    onClick={() => openMediaModal(image, 'image')}
                  >
                    {/* Overlay for owner controls */}
                    {isOwner && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMedia(image.id, 'image');
                          }}
                          className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors duration-200"
                        >
                          <i className="fas fa-trash text-sm"></i>
                        </button>
                      </div>
                    )}
                  </div>
                  {image.caption && (
                    <p className={`text-sm mt-2 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {image.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Videos Grid */}
        {videos.length > 0 && (
          <div>
            <h4 className={`text-md font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Videos
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {videos.map((video) => (
                <div key={video.id} className="relative group">
                  <div className="relative">
                    <video
                      className="w-full rounded-lg shadow-md"
                      controls
                      preload="metadata"
                    >
                      <source src={`http://localhost:8000${video.video}`} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    
                    {/* Overlay for owner controls */}
                    {isOwner && (
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={() => handleDeleteMedia(video.id, 'video')}
                          className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors duration-200 shadow-lg"
                        >
                          <i className="fas fa-trash text-sm"></i>
                        </button>
                      </div>
                    )}
                  </div>
                  {video.caption && (
                    <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {video.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Media Modal */}
      {showModal && selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeModal}
              className="absolute -top-4 -right-4 bg-white text-black p-2 rounded-full hover:bg-gray-200 transition-colors duration-200 z-10"
            >
              <i className="fas fa-times"></i>
            </button>
            
            {selectedMedia.mediaType === 'image' ? (
              <img
                src={`http://localhost:8000${selectedMedia.image}`}
                alt={selectedMedia.caption}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            ) : (
              <video
                className="max-w-full max-h-full rounded-lg"
                controls
                autoPlay
              >
                <source src={`http://localhost:8000${selectedMedia.video}`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
            
            {selectedMedia.caption && (
              <p className="text-white text-center mt-4 text-lg">
                {selectedMedia.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MediaDisplay;
