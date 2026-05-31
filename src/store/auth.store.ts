import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

const storedToken = localStorage.getItem('nexcart_token');
const storedUserStr = localStorage.getItem('nexcart_user');
let storedUser: User | null = null;
try {
  if (storedUserStr) storedUser = JSON.parse(storedUserStr);
} catch {
  storedUser = null;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser,
  token: storedToken,
  isAuthenticated: !!storedToken && !!storedUser,
  setAuth: (user, token) => {
    localStorage.setItem('nexcart_token', token);
    localStorage.setItem('nexcart_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('nexcart_token');
    localStorage.removeItem('nexcart_user');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
