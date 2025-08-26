import { useEffect, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';
import {
  fetchCategories,
  fetchImagesByCategory,
  searchImages,
  fetchImagesByTags,
  fetchImageDetails,
  uploadImage,
  clearSearchResults,
  clearImageDetails,
  clearCategoryCache,
  CloudinaryImage,
  ImageCategory
} from '../store/slices/imageSlice';

// Simple console logger for frontend
const logger = {
  error: (message: string, error?: any) => {
    console.error(message, error);
  },
  info: (message: string, data?: any) => {
    console.info(message, data);
  },
  warn: (message: string, data?: any) => {
    console.warn(message, data);
  }
};

export interface UseImagesOptions {
  category?: string;
  autoFetch?: boolean;
  page?: number;
  limit?: number;
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const useImages = (options: UseImagesOptions = {}) => {
  const dispatch = useAppDispatch();
  const {
    categories,
    categoriesLoading,
    categoriesError,
    imagesByCategory,
    categoryLoading,
    categoryError,
    searchResults,
    searchLoading,
    searchError,
    searchQuery,
    currentImage,
    imageDetailsLoading,
    imageDetailsError,
    uploadLoading,
    uploadError,
    uploadProgress
  } = useAppSelector(state => state.images);

  const {
    category,
    autoFetch = true,
    page = 1,
    limit = 50,
    tags = [],
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = options;

  // Memoized selectors
  const categoryImages = useMemo(() => {
    if (!category) return null;
    const cacheKey = `${category}_${page}_${limit}`;
    return imagesByCategory[cacheKey] || null;
  }, [imagesByCategory, category, page, limit]);

  const isCategoryLoading = useMemo(() => {
    return category ? categoryLoading[category] || false : false;
  }, [categoryLoading, category]);

  const categoryErrorMessage = useMemo(() => {
    return category ? categoryError[category] || null : null;
  }, [categoryError, category]);

  // Fetch categories on mount
  useEffect(() => {
    if (autoFetch && categories.length === 0 && !categoriesLoading) {
      dispatch(fetchCategories());
    }
  }, [dispatch, autoFetch, categories.length, categoriesLoading]);

  // Fetch images by category
  useEffect(() => {
    if (autoFetch && category && !categoryImages && !isCategoryLoading) {
      dispatch(fetchImagesByCategory({
        category,
        page,
        limit,
        tags,
        sortBy,
        sortOrder
      })).catch((error) => {
        logger.error(`Failed to fetch images for category ${category}:`, error);
      });
    }
  }, [dispatch, autoFetch, category, page, limit, tags, sortBy, sortOrder, categoryImages, isCategoryLoading]);

  // Action creators
  const fetchCategoryImages = useCallback((params: {
    category: string;
    page?: number;
    limit?: number;
    tags?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    forceRefresh?: boolean;
  }) => {
    return dispatch(fetchImagesByCategory(params));
  }, [dispatch]);

  const searchImagesByQuery = useCallback((query: string, searchOptions?: {
    category?: string;
    limit?: number;
  }) => {
    return dispatch(searchImages({
      query,
      ...searchOptions
    }));
  }, [dispatch]);

  const fetchImagesByTagList = useCallback((tagList: string[], tagOptions?: {
    category?: string;
    limit?: number;
  }) => {
    return dispatch(fetchImagesByTags({
      tags: tagList,
      ...tagOptions
    }));
  }, [dispatch]);

  const getImageDetails = useCallback((publicId: string) => {
    return dispatch(fetchImageDetails(publicId));
  }, [dispatch]);

  const uploadImageToCategory = useCallback((params: {
    file: File;
    category: string;
    tags?: string[];
    filename?: string;
    onProgress?: (progress: number) => void;
  }) => {
    return dispatch(uploadImage(params));
  }, [dispatch]);

  const clearSearch = useCallback(() => {
    dispatch(clearSearchResults());
  }, [dispatch]);

  const clearDetails = useCallback(() => {
    dispatch(clearImageDetails());
  }, [dispatch]);

  const refreshCategoryCache = useCallback((categoryName: string) => {
    dispatch(clearCategoryCache(categoryName));
  }, [dispatch]);

  // Load more images for pagination
  const loadMoreImages = useCallback((categoryName: string) => {
    const currentData = imagesByCategory[`${categoryName}_${page}_${limit}`];
    if (currentData && currentData.hasMore) {
      return fetchCategoryImages({
        category: categoryName,
        page: page + 1,
        limit,
        tags,
        sortBy,
        sortOrder
      });
    }
    return Promise.resolve();
  }, [imagesByCategory, page, limit, tags, sortBy, sortOrder, fetchCategoryImages]);

  // Get images by specific criteria
  const getImagesByCategory = useCallback((categoryName: string) => {
    const cacheKey = `${categoryName}_1_${limit}`;
    return imagesByCategory[cacheKey]?.images || [];
  }, [imagesByCategory, limit]);

  const getCategoryByName = useCallback((categoryName: string): ImageCategory | null => {
    return categories.find(cat => cat.name === categoryName) || null;
  }, [categories]);

  // Utility functions
  const getOptimizedImageUrl = useCallback((image: CloudinaryImage, size: 'thumbnail' | 'medium' | 'large' = 'medium') => {
    switch (size) {
      case 'thumbnail':
        return image.thumbnailUrl;
      case 'large':
        return image.largeUrl;
      default:
        return image.mediumUrl;
    }
  }, []);

  const getResponsiveImageUrl = useCallback((image: CloudinaryImage, device: 'mobile' | 'tablet' | 'desktop' = 'desktop') => {
    return image.responsiveUrls[device];
  }, []);

  const filterImagesByTags = useCallback((images: CloudinaryImage[], filterTags: string[]) => {
    return images.filter(image =>
      filterTags.some(tag => image.tags.includes(tag))
    );
  }, []);

  return {
    // Data
    categories,
    categoryImages,
    searchResults,
    currentImage,

    // Loading states
    categoriesLoading,
    isCategoryLoading,
    searchLoading,
    imageDetailsLoading,
    uploadLoading,

    // Error states
    categoriesError,
    categoryErrorMessage,
    searchError,
    imageDetailsError,
    uploadError,

    // Upload progress
    uploadProgress,

    // Search query
    searchQuery,

    // Actions
    fetchCategoryImages,
    searchImagesByQuery,
    fetchImagesByTagList,
    getImageDetails,
    uploadImageToCategory,
    clearSearch,
    clearDetails,
    refreshCategoryCache,
    loadMoreImages,

    // Utilities
    getImagesByCategory,
    getCategoryByName,
    getOptimizedImageUrl,
    getResponsiveImageUrl,
    filterImagesByTags
  };
};

// Specialized hooks for specific use cases
export const useCategoryImages = (category: string, options?: Omit<UseImagesOptions, 'category'>) => {
  return useImages({ ...options, category });
};

export const useImageSearch = () => {
  const dispatch = useAppDispatch();
  const { searchResults, searchLoading, searchError, searchQuery } = useAppSelector(state => state.images);

  const search = useCallback((query: string, options?: { category?: string; limit?: number }) => {
    return dispatch(searchImages({ query, ...options }));
  }, [dispatch]);

  const clearResults = useCallback(() => {
    dispatch(clearSearchResults());
  }, [dispatch]);

  return {
    searchResults,
    searchLoading,
    searchError,
    searchQuery,
    search,
    clearResults
  };
};

export const useImageUpload = () => {
  const dispatch = useAppDispatch();
  const { uploadLoading, uploadError, uploadProgress } = useAppSelector(state => state.images);

  const upload = useCallback((params: {
    file: File;
    category: string;
    tags?: string[];
    filename?: string;
    onProgress?: (progress: number) => void;
  }) => {
    return dispatch(uploadImage(params));
  }, [dispatch]);

  return {
    uploadLoading,
    uploadError,
    uploadProgress,
    upload
  };
};