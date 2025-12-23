import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/utils/api";

// Cart key for localStorage
const CART_STORAGE_KEY = "king_neon_cart";

export interface CartItem {
  id: string; // Database Row ID (User) OR Product ID/Random (Guest)
  productId: string; // Reference to product
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

interface ApiCartItem {
  id: string; // Added ID from DB
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  type: "product" | "custom";
  image?: string;
  options?: CartItem["options"];
}

// Helper to map API items to CartItems
const mapApiItemsToCartItems = (apiItems: ApiCartItem[]): CartItem[] => {
  return apiItems.map((item) => ({
    id: item.id, // Use Database ID
    productId: item.productId,
    name: item.productName,
    price: item.price,
    quantity: item.quantity,
    image: item.image,
    type: item.type,
    options: item.options,
  }));
};

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
    } catch {
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
      return response.data.items || [];
    } catch {
      return rejectWithValue("Failed to sync cart");
    }
  }
);

export const mergeCartOnLogin = createAsyncThunk(
  "cart/mergeOnLogin",
  async (_, { rejectWithValue }) => {
    const guestItems = loadCartFromStorage();

    if (guestItems.length === 0) {
      // Just fetch user's cart from API
      try {
        const response = await api.get("/cart");
        return response.data.items || [];
      } catch {
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
    } catch {
      return rejectWithValue("Failed to merge cart");
    }
  }
);

export const removeItemFromAPI = createAsyncThunk(
  "cart/removeFromAPI",
  async (itemId: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/cart/items/${itemId}`);
      return response.data.items || [];
    } catch {
      return rejectWithValue("Failed to remove item");
    }
  }
);

export const updateItemQuantityAPI = createAsyncThunk(
  "cart/updateItemQuantityAPI",
  async (
    { itemId, quantity }: { itemId: string; quantity: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(`/cart/items/${itemId}`, { quantity });
      return response.data.items || [];
    } catch {
      return rejectWithValue("Failed to update item quantity");
    }
  }
);

export const clearCartAPI = createAsyncThunk(
  "cart/clearAPI",
  async (_, { rejectWithValue }) => {
    try {
      await api.delete("/cart");
      return true;
    } catch {
      return rejectWithValue("Failed to clear cart");
    }
  }
);

// Wrapper thunks that handle both guest and user logic
export const addItemToCart = createAsyncThunk(
  "cart/addItem",
  async (item: CartItem, { dispatch, getState, rejectWithValue }) => {
    const state = getState() as { cart: CartState };
    if (state.cart.isAuthenticated) {
      try {
        return await dispatch(syncCartToAPI(item)).unwrap();
      } catch (error) {
        return rejectWithValue(error);
      }
    } else {
      dispatch(cartSlice.actions.addToCart(item));
      return null;
    }
  }
);

export const removeItemFromCart = createAsyncThunk(
  "cart/removeItem",
  async (itemId: string, { dispatch, getState, rejectWithValue }) => {
    const state = getState() as { cart: CartState };
    if (state.cart.isAuthenticated) {
      try {
        return await dispatch(removeItemFromAPI(itemId)).unwrap();
      } catch (error) {
        return rejectWithValue(error);
      }
    } else {
      dispatch(cartSlice.actions.removeFromCart(itemId));
      return null;
    }
  }
);

export const updateCartItemQuantity = createAsyncThunk(
  "cart/updateQuantity",
  async (
    { id, quantity }: { id: string; quantity: number },
    { dispatch, getState, rejectWithValue }
  ) => {
    const state = getState() as { cart: CartState };
    if (state.cart.isAuthenticated) {
      try {
        return await dispatch(
          updateItemQuantityAPI({ itemId: id, quantity })
        ).unwrap();
      } catch (error) {
        return rejectWithValue(error);
      }
    } else {
      dispatch(cartSlice.actions.updateQuantity({ id, quantity }));
      return null;
    }
  }
);

export const clearAllCart = createAsyncThunk(
  "cart/clearAll",
  async (_, { dispatch, getState, rejectWithValue }) => {
    const state = getState() as { cart: CartState };
    if (state.cart.isAuthenticated) {
      try {
        return await dispatch(clearCartAPI()).unwrap();
      } catch (error) {
        return rejectWithValue(error);
      }
    } else {
      dispatch(cartSlice.actions.clearCart());
      return null;
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
      // Ensure productId is present (for legacy/guest items)
      const newItem = {
        ...action.payload,
        productId: action.payload.productId || action.payload.id,
      };

      const existingItem = state.items.find(
        (item) =>
          item.productId === newItem.productId && item.type === newItem.type
      );

      if (existingItem) {
        existingItem.quantity += newItem.quantity;
      } else {
        state.items.push(newItem);
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
        state.items = mapApiItemsToCartItems(action.payload);
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
        state.items = mapApiItemsToCartItems(action.payload);
      })
      .addCase(mergeCartOnLogin.rejected, (state) => {
        state.isLoading = false;
      })
      // Sync to API (Add to cart)
      .addCase(syncCartToAPI.fulfilled, (state, action) => {
        state.items = mapApiItemsToCartItems(action.payload);
      })
      // Remove from API
      .addCase(removeItemFromAPI.fulfilled, (state, action) => {
        state.items = mapApiItemsToCartItems(action.payload);
      })
      // Update Quantity API
      .addCase(updateItemQuantityAPI.fulfilled, (state, action) => {
        state.items = mapApiItemsToCartItems(action.payload);
      })
      // Clear Cart API
      .addCase(clearCartAPI.fulfilled, (state) => {
        state.items = [];
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
