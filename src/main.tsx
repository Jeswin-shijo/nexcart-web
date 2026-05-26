import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { useThemeStore } from './store/theme.store';

useThemeStore.getState().initTheme();

createRoot(document.getElementById('root')!).render(<App />);
