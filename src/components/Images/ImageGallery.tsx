import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Grid, List, Download, Heart, Share2, Eye, Loader2 } from 'lucide-react';
import { useCategoryImages, useImageSearch } from '../../hooks/useImages';
import { CloudinaryImage } from '../../store/slices/imageSlice';
import ImageCard from './ImageCard';
import ImageModal from './ImageModal';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorMessage from '../UI/ErrorMessage';

interface ImageGalleryProps {
  category: string;
  title?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  viewMode?: 'grid' | 'list';
  itemsPerPage?: number;
  onImageSelect?: (image: CloudinaryImage) => void;
  selectedImages?: string[];
  multiSelect?: boolean;
  className?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  category,
  title,
  showSearch = true,
  showFilters = true,
  viewMode: initialViewMode = 'grid',
  itemsPerPage = 20,
  onImageSelect,
  selectedImages = [],
  multiSelect = false,
  className = ''
}) => {
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedImage, setSelectedImage] = useState<CloudinaryImage | null>(null);
  const [page, setPage] = useState(1);

  const {
    categoryImages,
    isCategoryLoading,
    categoryErrorMessage,
    fetchCategoryImages,
    loadMoreImages
  } = useCategoryImages(category, {
    page,
    limit: itemsPerPage,
    tags: selectedTags,
    sortBy,
    sortOrder
  });

  const {
    searchResults,
    searchLoading,
    searchError,
    search: searchImages,
    clearResults: clearSearchResults
  } = useImageSearch();

  // Get current images to display
  // Defensive: handle malformed or empty backend responses
  let currentImages: CloudinaryImage[] = [];
  let hasMore = false;
  let warning: string | null = null;
  if (searchQuery) {
    currentImages = Array.isArray(searchResults) ? searchResults : [];
    hasMore = false;
  } else if (categoryImages && typeof categoryImages === 'object') {
    if (Array.isArray(categoryImages.images)) {
      currentImages = categoryImages.images;
      hasMore = !!categoryImages.hasMore;
      if (currentImages.length === 0) {
        warning = categoryImages.warning || 'No images found in this category.';
      }
    } else {
      warning = 'Malformed response from server: images not found.';
    }
  } else {
    warning = 'No data received from server.';
  }

  const isLoading = searchQuery ? searchLoading : isCategoryLoading;
  const error = searchQuery ? searchError : categoryErrorMessage;

  // Handle search
  const handleSearch = useCallback(async (query: string) => {
    if (query.trim()) {
      await searchImages(query, { category, limit: itemsPerPage });
    } else {
      clearSearchResults();
    }
  }, [searchImages, clearSearchResults, category, itemsPerPage]);

  // Handle filter changes
  const handleFilterChange = useCallback(async () => {
    setPage(1);
    await fetchCategoryImages({
      category,
      page: 1,
      limit: itemsPerPage,
      tags: selectedTags,
      sortBy,
      sortOrder,
      forceRefresh: true
    });
  }, [fetchCategoryImages, category, itemsPerPage, selectedTags, sortBy, sortOrder]);

  // Load more images
  const handleLoadMore = useCallback(async () => {
    if (hasMore && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      await loadMoreImages(category);
    }
  }, [hasMore, isLoading, page, loadMoreImages, category]);

  // Handle image selection
  const handleImageClick = useCallback((image: CloudinaryImage) => {
    if (onImageSelect) {
      onImageSelect(image);
    } else {
      setSelectedImage(image);
    }
  }, [onImageSelect]);

  // Get available tags from current images
  const availableTags = React.useMemo(() => {
    const tags = new Set<string>();
    currentImages.forEach(image => {
      image.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [currentImages]);

  // Search debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  // Filter change effect
  useEffect(() => {
    if (selectedTags.length > 0 || sortBy !== 'created_at' || sortOrder !== 'desc') {
      handleFilterChange();
    }
  }, [selectedTags, sortBy, sortOrder, handleFilterChange]);

  // Debug: log category and images
  useEffect(() => {
    if (categoryImages) {
      // eslint-disable-next-line no-console
      console.log('ImageGallery category:', category, 'images:', categoryImages.images);
    }
  }, [category, categoryImages]);

  // Show warning if no images or malformed response
  if (warning) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          {title && (
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          )}
          <p className="text-gray-600">
            {currentImages.length} images
            {categoryImages?.totalCount && ` of ${categoryImages.totalCount}`}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
          {/* Search */}
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tags Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Tags
                </label>
                <select
                  multiple
                  value={selectedTags}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    setSelectedTags(values);
                  }}
                  className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  size={3}
                >
                  {availableTags.map(tag => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="created_at">Date Created</option>
                  <option value="uploaded_at">Date Uploaded</option>
                  <option value="filename">Filename</option>
                  <option value="size">File Size</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>
          )}

          {/* Active Filters */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {selectedTags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                >
                  {tag}
                  <button
                    onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              ))}
              <button
                onClick={() => setSelectedTags([])}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Images</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
                {error.includes('Cloudinary authentication') && (
                  <p className="mt-1">Please check your Cloudinary API credentials in the environment variables.</p>
                )}
                {error.includes('not found') && (
                  <p className="mt-1">The folder might not exist in your Cloudinary account.</p>
                )}
              </div>
              <div className="mt-4">
                <button
                  onClick={() => {
                    if (searchQuery) {
                      handleSearch(searchQuery);
                    } else {
                      handleFilterChange();
                    }
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && currentImages.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && currentImages.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
          <p className="text-gray-600">
            {searchQuery
              ? `No images match your search for "${searchQuery}"`
              : 'No images available in this category'
            }
          </p>
        </div>
      )}

      {/* Images Grid/List */}
      {currentImages.length > 0 && (
        <>
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'
              : 'space-y-4'
          }>
            {currentImages.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                viewMode={viewMode}
                isSelected={selectedImages.includes(image.id)}
                onClick={() => handleImageClick(image)}
                showActions={true}
                className="cursor-pointer hover:shadow-lg transition-shadow"
              />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More Images'
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
};

export default ImageGallery;