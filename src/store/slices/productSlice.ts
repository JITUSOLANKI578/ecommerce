import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://ecommerce-7f1v.onrender.com/api';
// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


export interface ProductVariant {
  _id: string;
  size: string;
  color: string;
  colorCode?: string;
  sku: string;
  price: number;
  discountPrice?: number;
  stock: number;
  images: Array<{
    url: string;
    publicId?: string;
    alt?: string;
    isPrimary?: boolean;
  }>;
  measurements?: {
    bust?: string;
    waist?: string;
    hip?: string;
    length?: string;
    shoulder?: string;
    sleeve?: string;
  };
  weight?: number;
  isActive: boolean;
}

export interface ProductReview {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: {
      url: string;
    };
  };
  rating: number;
  title?: string;
  comment: string;
  images?: Array<{
    url: string;
    publicId?: string;
  }>;
  isVerified: boolean;
  helpfulCount: number;
  reportCount: number;
  isHidden: boolean;
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  basePrice: number;
  comparePrice?: number;
  costPrice?: number;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  subcategory?: string;
  brand?: string;
  fabric: string;
  care?: string;
  occasion?: string[];
  season?: string[];
  style?: string;
  pattern?: string;
  neckline?: string;
  sleeves?: string;
  variants: ProductVariant[];
  images: Array<{
    url: string;
    publicId?: string;
    alt?: string;
    isPrimary?: boolean;
    sortOrder?: number;
  }>;
  video?: {
    url: string;
    publicId?: string;
    thumbnail?: string;
  };
  totalStock: number;
  lowStockThreshold: number;
  trackQuantity: boolean;
  allowBackorder: boolean;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  shippingClass?: string;
  reviews: ProductReview[];
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  viewCount: number;
  wishlistCount: number;
  soldCount: number;
  cartAddCount: number;
  conversionRate: number;
  tags: string[];
  searchKeywords: string[];
  status: 'draft' | 'active' | 'inactive' | 'archived';
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isOnSale: boolean;
  publishedAt?: string;
  availableFrom?: string;
  availableUntil?: string;
  faqs: Array<{
    question: string;
    answer: string;
    isActive: boolean;
  }>;
  ratings: number; // Assuming this is the average rating
  price: number;
  sizes: string[]; // Assuming this is an array of available sizes
  colors: string[]; // Assuming this is an array of available colors
  relatedProducts: Product[];
  createdAt: string;
  updatedAt: string;
  discountPrice?: number;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
  };
  vendor?: {
    _id: string;
    name: string;
  };
}

interface ProductFilters {
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  fabric?: string;
  brand?: string;
  occasion?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  onSale?: boolean;
  inStock?: boolean;
}

interface ProductState {
  products: Product[];
  featuredProducts: Product[];
  newArrivals: Product[];
  bestSellers: Product[];
  currentProduct: Product | null;
  recommendations: Product[];
  searchResults: Product[];
  categories: any[];
  filters: ProductFilters;
  availableFilters: {
    categories: any[];
    subcategories: string[];
    brands: string[];
    fabrics: string[];
    occasions: string[];
    sizes: string[];
    colors: string[];
    priceRange: {
      min: number;
      max: number;
    };
  };
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
}

const initialState: ProductState = {
  products: [],
  featuredProducts: [],
  newArrivals: [],
  bestSellers: [],
  currentProduct: null,
  recommendations: [],
  searchResults: [],
  categories: [],
  filters: {},
  availableFilters: {
    categories: [],
    subcategories: [],
    brands: [],
    fabrics: [],
    occasions: [],
    sizes: [],
    colors: [],
    priceRange: { min: 0, max: 0 }
  },
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalProducts: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 12
  }
};

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params: { page?: number; limit?: number; filters?: ProductFilters } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());

      if (params.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
      }

      const response = await axios.get(`${API_URL}/products?${queryParams.toString()}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/products/${productId}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product');
    }
  }
);

export const searchProducts = createAsyncThunk(
  'products/search',
  async (params: { q: string; page?: number; limit?: number; filters?: ProductFilters }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('q', params.q);

      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());

      if (params.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
      }

      const response = await axios.get(`${API_URL}/products/search?${queryParams.toString()}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeatured',
  async (limit: number = 8, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/products/featured?limit=${limit}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch featured products');
    }
  }
);

export const fetchNewArrivals = createAsyncThunk(
  'products/fetchNewArrivals',
  async (limit: number = 8, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/products/new-arrivals?limit=${limit}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch new arrivals');
    }
  }
);

export const fetchBestSellers = createAsyncThunk(
  'products/fetchBestSellers',
  async (limit: number = 8, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/products/best-sellers?limit=${limit}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch best sellers');
    }
  }
);

export const fetchRecommendations = createAsyncThunk(
  'products/fetchRecommendations',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/products/${productId}/recommendations`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recommendations');
    }
  }
);

export const fetchFilters = createAsyncThunk(
  'products/fetchFilters',
  async (category?: string, { rejectWithValue }) => {
    try {
      const queryParams = category ? `?category=${category}` : '';
      const response = await axios.get(`${API_URL}/products/filters${queryParams}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch filters');
    }
  }
);

export const addProductReview = createAsyncThunk(
  'products/addReview',
  async ({ productId, reviewData }: { productId: string; reviewData: { rating: number; title?: string; comment: string; images?: any[] } }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/products/${productId}/reviews`, reviewData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add review');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    updateProductInList: (state, action) => {
      const updatedProduct = action.payload;

      // Update in products array
      const productIndex = state.products.findIndex(p => p._id === updatedProduct._id);
      if (productIndex !== -1) {
        state.products[productIndex] = updatedProduct;
      }

      // Update current product if it matches
      if (state.currentProduct && state.currentProduct._id === updatedProduct._id) {
        state.currentProduct = updatedProduct;
      }

      // Update in featured products
      const featuredIndex = state.featuredProducts.findIndex(p => p._id === updatedProduct._id);
      if (featuredIndex !== -1) {
        state.featuredProducts[featuredIndex] = updatedProduct;
      }

      // Update in new arrivals
      const newArrivalIndex = state.newArrivals.findIndex(p => p._id === updatedProduct._id);
      if (newArrivalIndex !== -1) {
        state.newArrivals[newArrivalIndex] = updatedProduct;
      }

      // Update in best sellers
      const bestSellerIndex = state.bestSellers.findIndex(p => p._id === updatedProduct._id);
      if (bestSellerIndex !== -1) {
        state.bestSellers[bestSellerIndex] = updatedProduct;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle the response structure
        if (action.payload) {
          state.currentProduct = action.payload.product || action.payload;
        } else {
          state.error = 'Invalid product data received';
          state.currentProduct = null;
        }
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.currentProduct = null;
      })

      // Search products
      .addCase(searchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Featured products
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featuredProducts = action.payload.products;
      })

      // New arrivals
      .addCase(fetchNewArrivals.fulfilled, (state, action) => {
        state.newArrivals = action.payload.products;
      })

      // Best sellers
      .addCase(fetchBestSellers.fulfilled, (state, action) => {
        state.bestSellers = action.payload.products;
      })

      // Recommendations
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.recommendations = action.payload.recommendations;
      })

      // Filters
      .addCase(fetchFilters.fulfilled, (state, action) => {
        state.availableFilters = action.payload.filters;
      })

      // Add review
      .addCase(addProductReview.fulfilled, (state, action) => {
        if (state.currentProduct) {
          state.currentProduct = action.payload.product;
        }
      });
  }
});

export const {
  setFilters,
  clearFilters,
  clearError,
  clearCurrentProduct,
  clearSearchResults,
  updateProductInList
} = productSlice.actions;

export default productSlice.reducer;
