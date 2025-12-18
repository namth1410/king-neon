import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/utils/api";

// Cart key for localStorage
const CART_STORAGE_KEY = "king_neon_cart";

export interface CartItem {
  id: string;
  type: "product" | "custom";
  name: string;
  price: number;
  quantity: number;
  image?: string;
  options?: {
    font?: string;
    color?: string;
    size?: string;
    material?: string;
    backboard?: string;
    backboardColor?: string;
  };
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Load cart from localStorage
const loadCartFromStorage = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save cart to localStorage
const saveCartToStorage = (items: CartItem[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    console.error("Failed to save cart to localStorage");
  }
};

// Clear cart from localStorage
const clearCartStorage = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch {
    console.error("Failed to clear cart from localStorage");
  }
};

// Async thunks for API operations
export const fetchCartFromAPI = createAsyncThunk(
  "cart/fetchFromAPI",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/cart");
      return response.data.items || [];
    } catch (error) {
      return rejectWithValue("Failed to fetch cart");
    }
  }
);

export const syncCartToAPI = createAsyncThunk(
  "cart/syncToAPI",
  async (item: CartItem, { rejectWithValue }) => {
    try {
      const response = await api.post("/cart/items", {
        productId: item.id,
        productName: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        type: item.type,
        options: item.options,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue("Failed to sync cart");
    }
  }
);

export const mergeCartOnLogin = createAsyncThunk(
  "cart/mergeOnLogin",
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { cart: CartState };
    const guestItems = loadCartFromStorage();

    if (guestItems.length === 0) {
      // Just fetch user's cart from API
      try {
        const response = await api.get("/cart");
        return response.data.items || [];
      } catch (error) {
        return rejectWithValue("Failed to fetch cart");
      }
    }

    // Merge guest cart with API cart
    try {
      const response = await api.post("/cart/merge", {
        items: guestItems.map((item) => ({
          productId: item.id,
          productName: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          type: item.type,
          options: item.options,
        })),
      });
      // Clear localStorage after merge
      clearCartStorage();
      return response.data.items || [];
    } catch (error) {
      return rejectWithValue("Failed to merge cart");
    }
  }
);

export const removeItemFromAPI = createAsyncThunk(
  "cart/removeFromAPI",
  async (itemId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/cart/items/${itemId}`);
      return itemId;
    } catch (error) {
      return rejectWithValue("Failed to remove item");
    }
  }
);

export const clearCartAPI = createAsyncThunk(
  "cart/clearAPI",
  async (_, { rejectWithValue }) => {
    try {
      await api.delete("/cart");
      return true;
    } catch (error) {
      return rejectWithValue("Failed to clear cart");
    }
  }
);

const initialState: CartState = {
  items: [],
  isOpen: false,
  isLoading: false,
  isAuthenticated: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Initialize cart - called on app mount
    initializeCart: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
      if (!action.payload) {
        // Guest user - load from localStorage
        state.items = loadCartFromStorage();
      }
    },

    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        (item) =>
          item.id === action.payload.id && item.type === action.payload.type
      );

      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }

      // Save to localStorage for guests
      if (!state.isAuthenticated) {
        saveCartToStorage(state.items);
      }
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      if (!state.isAuthenticated) {
        saveCartToStorage(state.items);
      }
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) {
        item.quantity = Math.max(0, action.payload.quantity);
        if (item.quantity === 0) {
          state.items = state.items.filter((i) => i.id !== action.payload.id);
        }
      }
      if (!state.isAuthenticated) {
        saveCartToStorage(state.items);
      }
    },

    clearCart: (state) => {
      state.items = [];
      if (!state.isAuthenticated) {
        clearCartStorage();
      }
    },

    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },

    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
    },

    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },

    openCart: (state) => {
      state.isOpen = true;
    },

    closeCart: (state) => {
      state.isOpen = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart from API
      .addCase(fetchCartFromAPI.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCartFromAPI.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.map(
          (item: {
            productId: string;
            productName: string;
            price: number;
            quantity: number;
            image?: string;
            type: "product" | "custom";
            options?: CartItem["options"];
          }) => ({
            id: item.productId,
            name: item.productName,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            type: item.type,
            options: item.options,
          })
        );
      })
      .addCase(fetchCartFromAPI.rejected, (state) => {
        state.isLoading = false;
      })
      // Merge cart on login
      .addCase(mergeCartOnLogin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(mergeCartOnLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.items = action.payload.map(
          (item: {
            productId: string;
            productName: string;
            price: number;
            quantity: number;
            image?: string;
            type: "product" | "custom";
            options?: CartItem["options"];
          }) => ({
            id: item.productId,
            name: item.productName,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            type: item.type,
            options: item.options,
          })
        );
      })
      .addCase(mergeCartOnLogin.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const {
  initializeCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setAuthenticated,
  setCartItems,
  toggleCart,
  openCart,
  closeCart,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((count, item) => count + item.quantity, 0);
export const selectCartTotal = (state: { cart: CartState }) =>
  state.cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
export const selectIsCartOpen = (state: { cart: CartState }) =>
  state.cart.isOpen;
export const selectIsCartLoading = (state: { cart: CartState }) =>
  state.cart.isLoading;

export default cartSlice.reducer;
