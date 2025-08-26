import React, { useState } from 'react';
import { Download, Heart, Share2, Eye, Calendar, Tag, Image as ImageIcon } from 'lucide-react';
import { CloudinaryImage } from '../../store/slices/imageSlice';
import { formatFileSize, formatDate } from '../../utils/helpers';

interface ImageCardProps {
  image: CloudinaryImage;
  viewMode?: 'grid' | 'list';
  isSelected?: boolean;
  onClick?: () => void;
  showActions?: boolean;
  className?: string;
}

const ImageCard: React.FC<ImageCardProps> = ({
  image,
  viewMode = 'grid',
  isSelected = false,
  onClick,
  showActions = true,
  className = ''
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(image.url);
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

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(image.url);
        // You could show a toast notification here
      } catch (error) {
        console.error('Copy to clipboard failed:', error);
      }
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Implement favorite functionality
    console.log('Add to favorites:', image.id);
  };

  if (viewMode === 'list') {
    return (
      <div
        className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer ${
          isSelected ? 'ring-2 ring-purple-500' : ''
        } ${className}`}
        onClick={onClick}
      >
        <div className="flex items-center p-4 space-x-4">
          {/* Thumbnail */}
          <div className="relative w-20 h-20 flex-shrink-0">
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
            )}
            {imageError ? (
              <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
            ) : (
              <img
                src={image.thumbnailUrl}
                alt={image.filename || image.id}
                className={`w-full h-full object-cover rounded-lg transition-opacity ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {image.filename || image.id}
            </h3>
            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
              <span>{image.width} × {image.height}</span>
              <span>{formatFileSize(image.size)}</span>
              <span>{image.format.toUpperCase()}</span>
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                {formatDate(image.createdAt)}
              </span>
            </div>
            {image.tags.length > 0 && (
              <div className="mt-2 flex items-center space-x-2">
                <Tag className="w-4 h-4 text-gray-400" />
                <div className="flex flex-wrap gap-1">
                  {image.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {image.tags.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{image.tags.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleFavorite}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Add to favorites"
              >
                <Heart className="w-5 h-5" />
              </button>
              <button
                onClick={handleShare}
                className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                title="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1 ${
        isSelected ? 'ring-2 ring-purple-500' : ''
      } ${className}`}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}

        {imageError ? (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-gray-400" />
          </div>
        ) : (
          <img
            src={image.thumbnailUrl || image.url}
            alt={image.filename || image.id}
            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={e => {
              // Try fallback to image.url if thumbnail fails
              if (e.currentTarget.src !== image.url && image.url) {
                e.currentTarget.src = image.url;
              } else {
                setImageError(true);
              }
            }}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300" />

        {/* Actions */}
        {showActions && (
          <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            <button
              onClick={handleFavorite}
              className="p-2 bg-white/90 hover:bg-white text-gray-700 hover:text-red-500 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
              title="Add to favorites"
            >
              <Heart className="w-4 h-4" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 bg-white/90 hover:bg-white text-gray-700 hover:text-blue-500 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 bg-white/90 hover:bg-white text-gray-700 hover:text-green-500 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* View Button */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <button className="w-full bg-white/90 hover:bg-white text-gray-800 py-2 px-4 rounded-lg font-medium flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-lg">
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </button>
        </div>

        {/* Format Badge */}
        <div className="absolute top-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {image.format.toUpperCase()}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 truncate mb-2">
          {image.filename || image.id}
        </h3>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span>{image.width} × {image.height}</span>
          <span>{formatFileSize(image.size)}</span>
        </div>

        {/* Tags */}
        {image.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {image.tags.slice(0, 2).map(tag => (
              <span
                key={tag}
                className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded-full"
              >
                {tag}
              </span>
            ))}
            {image.tags.length > 2 && (
              <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded-full">
                +{image.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCard;