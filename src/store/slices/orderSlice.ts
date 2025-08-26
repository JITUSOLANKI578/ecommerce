import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface OrderItem {
  product: string;
  name: string;
  image: string;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  price: number;
  totalPrice: number;
}

interface ShippingAddress {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  user: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentResult?: {
    id: string;
    status: string;
    update_time: string;
    email_address: string;
  };
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  paymentStatus: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  orderStatus: 'placed' | 'confirmed' | 'processing' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned';
  isDelivered: boolean;
  deliveredAt?: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  notes?: string;
  cancellationReason?: string;
  returnReason?: string;
  refundAmount: number;
  statusHistory: Array<{
    status: string;
    timestamp: string;
    note: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalOrders: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalOrders: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
};

// Async thunks
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData: {
    items: any[];
    shippingAddress: ShippingAddress;
    paymentMethod: string;
    itemsPrice: number;
    shippingPrice: number;
    taxPrice: number;
    totalPrice: number;
  }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/orders', orderData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create order');
    }
  }
);

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (params: { page?: number; limit?: number; status?: string } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.status) queryParams.append('status', params.status);

      const response = await axios.get(`/orders?${queryParams.toString()}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/orders/${orderId}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ orderId, status, note }: { orderId: string; status: string; note?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/orders/${orderId}/status`, { status, note });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update order status');
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async ({ orderId, reason }: { orderId: string; reason: string }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/orders/${orderId}/cancel`, { reason });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel order');
    }
  }
);

export const returnOrder = createAsyncThunk(
  'orders/returnOrder',
  async ({ orderId, reason, items }: { orderId: string; reason: string; items?: string[] }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/orders/${orderId}/return`, { reason, items });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to return order');
    }
  }
);

export const trackOrder = createAsyncThunk(
  'orders/trackOrder',
  async (orderNumber: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/orders/track/${orderNumber}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to track order');
    }
  }
);

export const processPayment = createAsyncThunk(
  'orders/processPayment',
  async ({ orderId, paymentData }: { orderId: string; paymentData: any }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/orders/${orderId}/payment`, paymentData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Payment processing failed');
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateOrderInList: (state, action) => {
      const updatedOrder = action.payload;
      state.orders = state.orders.map(order => 
        order._id === updatedOrder._id ? updatedOrder : order
      );
      
      if (state.currentOrder && state.currentOrder._id === updatedOrder._id) {
        state.currentOrder = updatedOrder;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload.order;
        state.orders.unshift(action.payload.order);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload.order;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update order status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const updatedOrder = action.payload.order;
        state.orders = state.orders.map(order => 
          order._id === updatedOrder._id ? updatedOrder : order
        );
        
        if (state.currentOrder && state.currentOrder._id === updatedOrder._id) {
          state.currentOrder = updatedOrder;
        }
      })

      // Cancel order
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const updatedOrder = action.payload.order;
        state.orders = state.orders.map(order => 
          order._id === updatedOrder._id ? updatedOrder : order
        );
        
        if (state.currentOrder && state.currentOrder._id === updatedOrder._id) {
          state.currentOrder = updatedOrder;
        }
      })

      // Return order
      .addCase(returnOrder.fulfilled, (state, action) => {
        const updatedOrder = action.payload.order;
        state.orders = state.orders.map(order => 
          order._id === updatedOrder._id ? updatedOrder : order
        );
        
        if (state.currentOrder && state.currentOrder._id === updatedOrder._id) {
          state.currentOrder = updatedOrder;
        }
      })

      // Track order
      .addCase(trackOrder.fulfilled, (state, action) => {
        state.currentOrder = action.payload.order;
      })

      // Process payment
      .addCase(processPayment.fulfilled, (state, action) => {
        const updatedOrder = action.payload.order;
        state.orders = state.orders.map(order => 
          order._id === updatedOrder._id ? updatedOrder : order
        );
        
        if (state.currentOrder && state.currentOrder._id === updatedOrder._id) {
          state.currentOrder = updatedOrder;
        }
      });
  },
});

export const { clearCurrentOrder, clearError, updateOrderInList } = orderSlice.actions;
export default orderSlice.reducer;