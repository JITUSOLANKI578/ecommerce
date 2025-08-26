import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Product, ProductVariant } from './productSlice';

interface CartItem {
  _id: string;
  product: Product | string;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  variant: string;
  price: number;
  discountPrice?: number;
  totalPrice: number;
  addedAt: string;
  savedForLater?: boolean;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  isLoading: boolean;
  error: string | null;
  shippingAddress: any;
  paymentMethod: string;
  discount: {
    amount: number;
    coupon?: {
      _id: string;
      code: string;
      name: string;
      type: string;
      value: number;
    };
    type?: string;
  };
  tax: {
    amount: number;
    rate: number;
  };
  shipping: {
    amount: number;
    method?: string;
    estimatedDelivery?: string;
  };
  total: number;
  currency: string;
}

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
  isLoading: false,
  error: null,
  shippingAddress: null,
  paymentMethod: '',
  discount: {
    amount: 0
  },
  tax: {
    amount: 0,
    rate: 0
  },
  shipping: {
    amount: 0
  },
  total: 0,
  currency: 'INR'
};

const API_URL = import.meta.env.VITE_API_URL || 'https://ecommerce-gwz9.onrender.com/api';
// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/cart`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (params: {
    productId: string;
    variantId: string;
    quantity: number;
  }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/cart/add`, params);
      toast.success('Item added to cart successfully!');
      return response.data.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add item to cart');
      return rejectWithValue(error.response?.data?.message || 'Failed to add item to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateItem',
  async ({ itemId, quantity }: { itemId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/cart/items/${itemId}`, { quantity });
      toast.success('Cart updated successfully!');
      return response.data.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update cart item');
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart item');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeItem',
  async (itemId: string, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/cart/items/${itemId}`);
      toast.success('Item removed from cart!');
      return response.data.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove item from cart');
      return rejectWithValue(error.response?.data?.message || 'Failed to remove item from cart');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/cart/clear`);
      toast.success('Cart cleared successfully!');
      return response.data.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to clear cart');
      return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
    }
  }
);

export const applyCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async (couponCode: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/cart/coupon/apply`, { couponCode });
      toast.success('Coupon applied successfully!');
      return response.data.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to apply coupon');
      return rejectWithValue(error.response?.data?.message || 'Failed to apply coupon');
    }
  }
);

export const removeCoupon = createAsyncThunk(
  'cart/removeCoupon',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/cart/coupon/remove`);
      toast.success('Coupon removed successfully!');
      return response.data.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove coupon');
      return rejectWithValue(error.response?.data?.message || 'Failed to remove coupon');
    }
  }
);

export const saveForLater = createAsyncThunk(
  'cart/saveForLater',
  async (itemId: string, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/cart/items/${itemId}/save-for-later`);
      toast.success('Item saved for later!');
      return response.data.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save item for later');
      return rejectWithValue(error.response?.data?.message || 'Failed to save item for later');
    }
  }
);

export const moveToCart = createAsyncThunk(
  'cart/moveToCart',
  async (itemId: string, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/cart/items/${itemId}/move-to-cart`);
      toast.success('Item moved to cart!');
      return response.data.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to move item to cart');
      return rejectWithValue(error.response?.data?.message || 'Failed to move item to cart');
    }
  }
);

export const syncCart = createAsyncThunk(
  'cart/syncCart',
  async (items: any[], { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/cart/sync`, { items });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to sync cart');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
    },

    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    resetCart: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.cart) {
          const cart = action.payload.cart;
          state.items = cart.items;
          state.totalItems = cart.totalItems;
          state.totalAmount = cart.subtotal;
          state.discount = cart.discount;
          state.tax = cart.tax;
          state.shipping = cart.shipping;
          state.total = cart.total;
          state.currency = cart.currency;
        }
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Add to cart
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.cart) {
          const cart = action.payload.cart;
          state.items = cart.items;
          state.totalItems = cart.totalItems;
          state.totalAmount = cart.subtotal;
          state.discount = cart.discount;
          state.tax = cart.tax;
          state.shipping = cart.shipping;
          state.total = cart.total;
        }
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update cart item
      .addCase(updateCartItem.fulfilled, (state, action) => {
        if (action.payload.cart) {
          const cart = action.payload.cart;
          state.items = cart.items;
          state.totalItems = cart.totalItems;
          state.totalAmount = cart.subtotal;
          state.discount = cart.discount;
          state.tax = cart.tax;
          state.shipping = cart.shipping;
          state.total = cart.total;
        }
      })

      // Remove from cart
      .addCase(removeFromCart.fulfilled, (state, action) => {
        if (action.payload.cart) {
          const cart = action.payload.cart;
          state.items = cart.items;
          state.totalItems = cart.totalItems;
          state.totalAmount = cart.subtotal;
          state.discount = cart.discount;
          state.tax = cart.tax;
          state.shipping = cart.shipping;
          state.total = cart.total;
        }
      })

      // Clear cart
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.totalItems = 0;
        state.totalAmount = 0;
        state.discount = { amount: 0 };
        state.tax = { amount: 0, rate: 0 };
        state.shipping = { amount: 0 };
        state.total = 0;
      })

      // Apply coupon
      .addCase(applyCoupon.fulfilled, (state, action) => {
        if (action.payload.cart) {
          const cart = action.payload.cart;
          state.discount = cart.discount;
          state.total = cart.total;
        }
      })

      // Remove coupon
      .addCase(removeCoupon.fulfilled, (state, action) => {
        if (action.payload.cart) {
          const cart = action.payload.cart;
          state.discount = cart.discount;
          state.total = cart.total;
        }
      })

      // Save for later
      .addCase(saveForLater.fulfilled, (state, action) => {
        if (action.payload.cart) {
          const cart = action.payload.cart;
          state.items = cart.items;
          state.totalItems = cart.totalItems;
          state.totalAmount = cart.subtotal;
          state.total = cart.total;
        }
      })

      // Move to cart
      .addCase(moveToCart.fulfilled, (state, action) => {
        if (action.payload.cart) {
          const cart = action.payload.cart;
          state.items = cart.items;
          state.totalItems = cart.totalItems;
          state.totalAmount = cart.subtotal;
          state.total = cart.total;
        }
      })

      // Sync cart
      .addCase(syncCart.fulfilled, (state, action) => {
        if (action.payload.cart) {
          const cart = action.payload.cart;
          state.items = cart.items;
          state.totalItems = cart.totalItems;
          state.totalAmount = cart.subtotal;
          state.discount = cart.discount;
          state.tax = cart.tax;
          state.shipping = cart.shipping;
          state.total = cart.total;
        }
      });
  },
});

export const { 
  setShippingAddress, 
  setPaymentMethod,
  clearError,
  resetCart
} = cartSlice.actions;

export default cartSlice.reducer;