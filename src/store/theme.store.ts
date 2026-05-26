import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: 'light',
  initTheme: () => {
    const saved = localStorage.getItem('nexcart_theme') as Theme | null;
    const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const theme = saved ?? preferred;
    set({ theme });
    document.documentElement.classList.toggle('dark', theme === 'dark');
  },
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    set({ theme: next });
    localStorage.setItem('nexcart_theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  },
}));
