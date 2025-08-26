import React, { useState } from 'react';
import { X, Download, Share2, Heart, ZoomIn, ZoomOut, RotateCw, Calendar, Tag, Image as ImageIcon } from 'lucide-react';
import { CloudinaryImage } from '../../store/slices/imageSlice';
import { formatFileSize, formatDate } from '../../utils/helpers';

interface ImageModalProps {
  image: CloudinaryImage;
  isOpen: boolean;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ image, isOpen, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      const response = await fetch(image.largeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${image.filename || image.id}.${image.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: image.filename || 'Image',
          url: image.url
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(image.url);
        // Show success message
      } catch (error) {
        console.error('Copy to clipboard failed:', error);
      }
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const resetTransform = () => {
    setZoom(1);
    setRotation(0);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-90 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full h-full flex">
        {/* Image Container */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div 
            className="relative max-w-full max-h-full overflow-hidden"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: 'transform 0.3s ease'
            }}
          >
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            )}
            <img
              src={image.largeUrl}
              alt={image.filename || image.id}
              className={`max-w-full max-h-full object-contain transition-opacity ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {image.filename || image.id}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Actions */}
          <div className="p-4 border-b">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
              <button
                onClick={handleShare}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
            </div>
          </div>

          {/* Transform Controls */}
          <div className="p-4 border-b">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Transform</h3>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={handleZoomIn}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleRotate}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Rotate"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                onClick={resetTransform}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs"
                title="Reset"
              >
                Reset
              </button>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Zoom: {Math.round(zoom * 100)}% | Rotation: {rotation}°
            </div>
          </div>

          {/* Image Details */}
          <div className="p-4 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Dimensions:</span>
                  <span className="text-gray-900">{image.width} × {image.height}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Size:</span>
                  <span className="text-gray-900">{formatFileSize(image.size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Format:</span>
                  <span className="text-gray-900">{image.format.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Folder:</span>
                  <span className="text-gray-900">{image.folder}</span>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Dates</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-500">Created:</span>
                  <span className="text-gray-900 ml-auto">{formatDate(image.createdAt)}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-500">Updated:</span>
                  <span className="text-gray-900 ml-auto">{formatDate(image.updatedAt)}</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {image.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <Tag className="w-4 h-4 mr-2" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {image.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* URLs */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">URLs</h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Original URL</label>
                  <input
                    type="text"
                    value={image.url}
                    readOnly
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1"
                    onClick={(e) => e.currentTarget.select()}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Thumbnail URL</label>
                  <input
                    type="text"
                    value={image.thumbnailUrl}
                    readOnly
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1"
                    onClick={(e) => e.currentTarget.select()}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;