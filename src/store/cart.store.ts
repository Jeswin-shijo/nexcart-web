import { create } from 'zustand';

export interface CartItem {
  variantId: string;
  qty: number;
  price: number;
  product?: {
    _id: string;
    title: string;
    images?: string[];
    slug?: string;
  };
  size?: string;
  color?: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  setCart: (cartData: { items: CartItem[]; total: number }) => void;
  clearCartStore: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  total: 0,
  itemCount: 0,
  setCart: (cartData) => {
    const itemCount = cartData.items.reduce((sum, item) => sum + item.qty, 0);
    set({ items: cartData.items, total: cartData.total, itemCount });
  },
  clearCartStore: () => set({ items: [], total: 0, itemCount: 0 }),
}));
