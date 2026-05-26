import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, User, Search, Menu, X, ChevronDown, Bell, Wallet, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/auth.store';
import { useCartStore } from '../../store/cart.store';
import { useThemeStore } from '../../store/theme.store';
import { getUnreadCount } from '../../api/notifications.api';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const { theme, toggleTheme } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const { data: unreadData } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: getUnreadCount,
    enabled: isAuthenticated,
    refetchInterval: 60000,
  });
  const unreadCount: number = unreadData?.count ?? 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  }

  function handleLogout() {
    logout();
    setProfileOpen(false);
    navigate('/');
  }

  return (
    <nav className={`bg-white dark:bg-dark-surface border-b border-transparent dark:border-dark-border sticky top-0 z-50 transition-shadow duration-200 ${scrolled ? 'shadow-md' : 'shadow-sm'}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary shrink-0">
            Nexcart
          </Link>

          {/* Search bar - hidden on mobile */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-4">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, brands and more"
                className="w-full pl-4 pr-10 py-2 border border-gray-200 dark:border-dark-border rounded-sm bg-gray-50 dark:bg-dark-bg text-sm text-gray-800 dark:text-dark-text placeholder:text-gray-400 dark:placeholder:text-dark-muted focus:outline-none focus:border-primary dark:focus:border-primary"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary">
                <Search size={18} />
              </button>
            </div>
          </form>

          {/* Right side actions */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="hidden md:flex flex-col items-center px-3 py-1 text-gray-600 dark:text-dark-text hover:text-primary dark:hover:text-primary transition-colors"
            >
              <Heart size={20} />
              <span className="text-xs mt-0.5">Wishlist</span>
            </Link>

            {/* Notifications bell */}
            {isAuthenticated && (
              <Link
                to="/notifications"
                className="hidden md:flex flex-col items-center px-3 py-1 text-gray-600 dark:text-dark-text hover:text-primary dark:hover:text-primary transition-colors relative"
              >
                <div className="relative">
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-xs mt-0.5">Alerts</span>
              </Link>
            )}

            {/* Wallet */}
            {isAuthenticated && (
              <Link
                to="/wallet"
                className="hidden md:flex flex-col items-center px-3 py-1 text-gray-600 dark:text-dark-text hover:text-primary dark:hover:text-primary transition-colors"
              >
                <Wallet size={20} />
                <span className="text-xs mt-0.5">Wallet</span>
              </Link>
            )}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="hidden md:flex flex-col items-center px-3 py-1 text-gray-600 dark:text-dark-text hover:text-primary dark:hover:text-primary transition-colors overflow-hidden"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                {theme === 'dark' ? (
                  <motion.span
                    key="sun"
                    initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun size={20} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="moon"
                    initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon size={20} />
                  </motion.span>
                )}
              </AnimatePresence>
              <span className="text-xs mt-0.5">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              className="hidden md:flex flex-col items-center px-3 py-1 text-gray-600 dark:text-dark-text hover:text-primary dark:hover:text-primary transition-colors relative"
            >
              <div className="relative">
                <ShoppingBag size={20} />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      key={itemCount}
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ duration: 0.3 }}
                      className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium"
                    >
                      {itemCount > 9 ? '9+' : itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <span className="text-xs mt-0.5">Bag</span>
            </Link>

            {/* Profile dropdown */}
            <div ref={profileRef} className="hidden md:flex flex-col items-center px-3 py-1 relative cursor-pointer">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex flex-col items-center text-gray-600 dark:text-dark-text hover:text-primary dark:hover:text-primary transition-colors"
              >
                <User size={20} />
                <span className="text-xs mt-0.5 flex items-center gap-0.5">
                  Profile <ChevronDown size={10} />
                </span>
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-12 right-0 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded shadow-lg w-48 py-1 z-50"
                  >
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-2 border-b border-gray-100 dark:border-dark-border">
                          <p className="text-sm font-medium text-gray-800 dark:text-dark-text truncate">{user?.name}</p>
                          <p className="text-xs text-gray-500 dark:text-dark-muted truncate">{user?.email}</p>
                        </div>
                        <Link
                          to="/orders/my"
                          onClick={() => setProfileOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg"
                        >
                          My Orders
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setProfileOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg"
                        >
                          My Profile
                        </Link>
                        {(user?.role === 'seller' || user?.role === 'admin') && (
                          <Link
                            to="/seller/dashboard"
                            onClick={() => setProfileOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg"
                          >
                            Seller Dashboard
                          </Link>
                        )}
                        {user?.role === 'admin' && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setProfileOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg"
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <div className="p-3">
                        <Link
                          to="/auth"
                          onClick={() => setProfileOpen(false)}
                          className="block w-full text-center bg-primary text-white py-2 px-4 rounded text-sm font-medium hover:bg-primary-600"
                        >
                          Login / Register
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-gray-600 dark:text-dark-text"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, brands and more"
                className="w-full pl-4 pr-10 py-2 border border-gray-200 dark:border-dark-border rounded-sm bg-gray-50 dark:bg-dark-bg text-sm text-gray-800 dark:text-dark-text placeholder:text-gray-400 dark:placeholder:text-dark-muted focus:outline-none focus:border-primary"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white dark:bg-dark-surface border-t border-gray-100 dark:border-dark-border overflow-hidden"
          >
            <div className="px-4 py-3 flex flex-col gap-3">
              <Link
                to="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-gray-700 dark:text-dark-text py-1"
              >
                <Heart size={18} /> Wishlist
              </Link>
              <Link
                to="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-gray-700 dark:text-dark-text py-1"
              >
                <ShoppingBag size={18} /> Bag {itemCount > 0 && <span className="bg-primary text-white text-xs px-1.5 py-0.5 rounded-full">{itemCount}</span>}
              </Link>
              {isAuthenticated && (
                <Link
                  to="/notifications"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-gray-700 dark:text-dark-text py-1"
                >
                  <Bell size={18} /> Notifications
                  {unreadCount > 0 && (
                    <span className="bg-pink-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              )}
              {isAuthenticated && (
                <Link
                  to="/wallet"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-gray-700 dark:text-dark-text py-1"
                >
                  <Wallet size={18} /> Wallet
                </Link>
              )}
              {/* Theme toggle mobile */}
              <button
                onClick={() => { toggleTheme(); setMobileMenuOpen(false); }}
                className="flex items-center gap-2 text-gray-700 dark:text-dark-text py-1 text-left"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
              {isAuthenticated ? (
                <>
                  <Link to="/orders/my" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-gray-700 dark:text-dark-text py-1">
                    My Orders
                  </Link>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-gray-700 dark:text-dark-text py-1">
                    My Profile
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 py-1 text-left">
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-primary text-white py-2 px-4 rounded text-sm font-medium text-center"
                >
                  Login / Register
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
