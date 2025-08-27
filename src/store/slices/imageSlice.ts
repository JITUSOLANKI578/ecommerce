import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://ecommerce-7f1v.onrender.com/api';
// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


export interface CloudinaryImage {
  id: string;
  url: string;
  originalUrl: string;
  thumbnailUrl: string;
  mediumUrl: string;
  largeUrl: string;
  responsiveUrls: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
  width: number;
  height: number;
  format: string;
  size: number;
  folder: string;
  filename: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ImageCategory {
  name: string;
  path: string;
  displayName: string;
  subcategories: ImageCategory[];
}

export interface ImageSearchResult {
  images: CloudinaryImage[];
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string;
  category?: string;
  page: number;
  limit: number;
  warning?: string;
}

interface ImageState {
  // Categories
  categories: ImageCategory[];
  categoriesLoading: boolean;
  categoriesError: string | null;

  // Images by category
  imagesByCategory: Record<string, ImageSearchResult>;
  categoryLoading: Record<string, boolean>;
  categoryError: Record<string, string | null>;

  // Search results
  searchResults: CloudinaryImage[];
  searchLoading: boolean;
  searchError: string | null;
  searchQuery: string;

  // Image details
  currentImage: CloudinaryImage | null;
  imageDetailsLoading: boolean;
  imageDetailsError: string | null;

  // Upload
  uploadLoading: boolean;
  uploadError: string | null;
  uploadProgress: number;

  // Cache management
  cacheTimestamps: Record<string, number>;
  cacheExpiry: number; // 5 minutes
}

const initialState: ImageState = {
  categories: [],
  categoriesLoading: false,
  categoriesError: null,

  imagesByCategory: {},
  categoryLoading: {},
  categoryError: {},

  searchResults: [],
  searchLoading: false,
  searchError: null,
  searchQuery: '',

  currentImage: null,
  imageDetailsLoading: false,
  imageDetailsError: null,

  uploadLoading: false,
  uploadError: null,
  uploadProgress: 0,

  cacheTimestamps: {},
  cacheExpiry: 5 * 60 * 1000 // 5 minutes
};

// Async thunks
export const fetchCategories = createAsyncThunk(
  'images/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/images/categories`);
      return response.data.data.categories;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const fetchImagesByCategory = createAsyncThunk(
  'images/fetchByCategory',
  async (params: {
    category: string;
    page?: number;
    limit?: number;
    tags?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    forceRefresh?: boolean;
  }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { images: ImageState };
      const cacheKey = `${params.category}_${params.page || 1}_${params.limit || 50}`;

      // Check cache unless force refresh
      if (!params.forceRefresh) {
        const cached = state.images.imagesByCategory[cacheKey];
        const cacheTime = state.images.cacheTimestamps[cacheKey];

        if (cached && cacheTime && (Date.now() - cacheTime < state.images.cacheExpiry)) {
          return { cached: true, data: cached };
        }
      }

      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.tags?.length) queryParams.append('tags', params.tags.join(','));
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await axios.get(
        `${API_URL}/images/category/${params.category}?${queryParams.toString()}`
      );

      return {
        cached: false,
        data: response.data.data,
        cacheKey
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch images');
    }
  }
);

export const searchImages = createAsyncThunk(
  'images/search',
  async (params: {
    query: string;
    category?: string;
    limit?: number;
  }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('q', params.query);
      if (params.category) queryParams.append('category', params.category);
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const response = await axios.get(`${API_URL}/images/search?${queryParams.toString()}`);
      return {
        images: response.data.data.images,
        query: params.query,
        totalCount: response.data.data.totalCount
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

export const fetchImagesByTags = createAsyncThunk(
  'images/fetchByTags',
  async (params: {
    tags: string[];
    category?: string;
    limit?: number;
  }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('tags', params.tags.join(','));
      if (params.category) queryParams.append('category', params.category);
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const response = await axios.get(`${API_URL}/images/tags?${queryParams.toString()}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch images by tags');
    }
  }
);

export const fetchImageDetails = createAsyncThunk(
  'images/fetchDetails',
  async (publicId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/images/details/${encodeURIComponent(publicId)}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch image details');
    }
  }
);

export const uploadImage = createAsyncThunk(
  'images/upload',
  async (params: {
    file: File;
    category: string;
    tags?: string[];
    filename?: string;
    onProgress?: (progress: number) => void;
  }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('image', params.file);
      if (params.tags?.length) {
        formData.append('tags', params.tags.join(','));
      }
      if (params.filename) {
        formData.append('filename', params.filename);
      }

      const response = await axios.post(
        `${API_URL}/images/upload/${params.category}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            params.onProgress?.(progress);
          },
        }
      );

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Upload failed');
    }
  }
);

export const generateOptimizedUrl = createAsyncThunk(
  'images/generateOptimizedUrl',
  async (params: {
    publicId: string;
    transformations: Record<string, any>;
  }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/images/optimize/${encodeURIComponent(params.publicId)}`,
        params.transformations
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate optimized URL');
    }
  }
);

const imageSlice = createSlice({
  name: 'images',
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchQuery = '';
      state.searchError = null;
    },

    clearImageDetails: (state) => {
      state.currentImage = null;
      state.imageDetailsError = null;
    },

    clearUploadState: (state) => {
      state.uploadError = null;
      state.uploadProgress = 0;
    },

    clearCategoryCache: (state, action) => {
      const category = action.payload;
      Object.keys(state.imagesByCategory).forEach(key => {
        if (key.startsWith(category)) {
          delete state.imagesByCategory[key];
          delete state.cacheTimestamps[key];
        }
      });
    },

    clearAllCache: (state) => {
      state.imagesByCategory = {};
      state.cacheTimestamps = {};
    },

    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },

    updateImageInCategory: (state, action) => {
      const { categoryKey, imageId, updates } = action.payload;
      const categoryData = state.imagesByCategory[categoryKey];
      if (categoryData) {
        const imageIndex = categoryData.images.findIndex(img => img.id === imageId);
        if (imageIndex !== -1) {
          categoryData.images[imageIndex] = { ...categoryData.images[imageIndex], ...updates };
        }
      }
    },

    removeImageFromCategory: (state, action) => {
      const { categoryKey, imageId } = action.payload;
      const categoryData = state.imagesByCategory[categoryKey];
      if (categoryData) {
        categoryData.images = categoryData.images.filter(img => img.id !== imageId);
        categoryData.totalCount -= 1;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesLoading = true;
        state.categoriesError = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.categoriesError = action.payload as string;
      })

      // Fetch images by category
      .addCase(fetchImagesByCategory.pending, (state, action) => {
        const category = action.meta.arg.category;
        if (category) {
          state.categoryLoading[category] = true;
          state.categoryError[category] = null;
        }
      })
      .addCase(fetchImagesByCategory.fulfilled, (state, action) => {
        const category = action.meta.arg.category;
        if (category) {
          state.categoryLoading[category] = false;

          if (action.payload.cached) {
            // Data was served from cache, no need to update
            return;
          }

          const { data, cacheKey } = action.payload;
          state.imagesByCategory[cacheKey] = data;
          state.cacheTimestamps[cacheKey] = Date.now();
        }
      })
      .addCase(fetchImagesByCategory.rejected, (state, action) => {
        const category = action.meta.arg.category;
        if (category) {
          state.categoryLoading[category] = false;
          state.categoryError[category] = action.payload as string;
        }
      })

      // Search images
      .addCase(searchImages.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(searchImages.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.images;
        state.searchQuery = action.payload.query;
      })
      .addCase(searchImages.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.payload as string;
      })

      // Fetch image details
      .addCase(fetchImageDetails.pending, (state) => {
        state.imageDetailsLoading = true;
        state.imageDetailsError = null;
      })
      .addCase(fetchImageDetails.fulfilled, (state, action) => {
        state.imageDetailsLoading = false;
        state.currentImage = action.payload;
      })
      .addCase(fetchImageDetails.rejected, (state, action) => {
        state.imageDetailsLoading = false;
        state.imageDetailsError = action.payload as string;
      })

      // Upload image
      .addCase(uploadImage.pending, (state) => {
        state.uploadLoading = true;
        state.uploadError = null;
        state.uploadProgress = 0;
      })
      .addCase(uploadImage.fulfilled, (state, action) => {
        state.uploadLoading = false;
        state.uploadProgress = 100;
        // Clear category cache to refresh images
        const category = action.meta.arg.category;
        Object.keys(state.imagesByCategory).forEach(key => {
          if (key.startsWith(category)) {
            delete state.imagesByCategory[key];
            delete state.cacheTimestamps[key];
          }
        });
      })
      .addCase(uploadImage.rejected, (state, action) => {
        state.uploadLoading = false;
        state.uploadError = action.payload as string;
        state.uploadProgress = 0;
      });
  },
});

export const {
  clearSearchResults,
  clearImageDetails,
  clearUploadState,
  clearCategoryCache,
  clearAllCache,
  setUploadProgress,
  updateImageInCategory,
  removeImageFromCategory
} = imageSlice.actions;

export default imageSlice.reducer;
