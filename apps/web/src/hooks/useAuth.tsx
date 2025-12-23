"use client";

import { useState, useEffect, createContext, useContext } from "react";
import api from "@/utils/api";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: { id: string; email: string; name: string } | null;
  token: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_TOKEN_KEY = "king_neon_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    token: null,
  });

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      // Validate token with API
      api
        .get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setState({
            isAuthenticated: true,
            isLoading: false,
            user: response.data,
            token,
          });
          // Set token for future requests
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        })
        .catch(() => {
          // Invalid token
          localStorage.removeItem(AUTH_TOKEN_KEY);
          setState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            token: null,
          });
        });
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { accessToken, user } = response.data;

      localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      setState({
        isAuthenticated: true,
        isLoading: false,
        user,
        token: accessToken,
      });

      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    delete api.defaults.headers.common["Authorization"];

    // Call logout API to clear server-side cookie
    api.post("/auth/logout").catch(() => {
      // Ignore errors, cookie might not exist
    });

    setState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      token: null,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    // Return default values if not in provider (for SSR)
    return {
      isAuthenticated: false,
      isLoading: true,
      user: null,
      token: null,
      login: async () => false,
      logout: () => {},
    };
  }
  return context;
}
