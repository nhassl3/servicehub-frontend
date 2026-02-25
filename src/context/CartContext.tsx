import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { cartApi } from '../api/cart';
import type { Cart } from '../types';
import { useAuth } from './AuthContext';

interface CartContextValue {
  cart: Cart | null;
  itemCount: number;
  isLoading: boolean;
  addItem: (productId: string, qty?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQty: (productId: string, qty: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) { setCart(null); return; }
    setIsLoading(true);
    try {
      const { cart } = await cartApi.get();
      setCart(cart);
    } catch {
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { refreshCart(); }, [refreshCart]);

  const addItem = useCallback(async (productId: string, qty = 1) => {
    const { cart } = await cartApi.addItem(productId, qty);
    setCart(cart);
  }, []);

  const removeItem = useCallback(async (productId: string) => {
    const { cart } = await cartApi.removeItem(productId);
    setCart(cart);
  }, []);

  const updateQty = useCallback(async (productId: string, qty: number) => {
    const { cart } = await cartApi.updateQty(productId, qty);
    setCart(cart);
  }, []);

  const clearCart = useCallback(async () => {
    await cartApi.clear();
    setCart(prev => prev ? { ...prev, items: [], subtotal: 0 } : null);
  }, []);

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <CartContext.Provider value={{ cart, itemCount, isLoading, addItem, removeItem, updateQty, clearCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
