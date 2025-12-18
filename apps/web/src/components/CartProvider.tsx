"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { initializeCart, mergeCartOnLogin } from "@/store/cartSlice";
import { useAuth } from "@/hooks/useAuth";
import { AppDispatch } from "@/store";

export default function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      // User is logged in - merge localStorage cart with API cart
      dispatch(mergeCartOnLogin());
    } else {
      // Guest user - load from localStorage
      dispatch(initializeCart(false));
    }
  }, [dispatch, isAuthenticated, isLoading]);

  return <>{children}</>;
}
