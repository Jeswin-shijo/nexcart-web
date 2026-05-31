import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/layout/Layout';
import ProtectedRoute from './router/ProtectedRoute';
import RoleRoute from './router/RoleRoute';

import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ProfilePage from './pages/ProfilePage';
import SellerDashboardPage from './pages/seller/SellerDashboardPage';
import SellerProductsPage from './pages/seller/SellerProductsPage';
import SellerOrdersPage from './pages/seller/SellerOrdersPage';
import SellerRegisterPage from './pages/seller/SellerRegisterPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminSellersPage from './pages/admin/AdminSellersPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import WalletPage from './pages/WalletPage';
import NotificationsPage from './pages/NotificationsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />

        {/* Protected */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <WishlistPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/my"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/my/:id"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <WalletPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        {/* Seller */}
        <Route
          path="/seller/dashboard"
          element={
            <RoleRoute allowedRoles={['seller', 'admin']}>
              <SellerDashboardPage />
            </RoleRoute>
          }
        />
        <Route
          path="/seller/products"
          element={
            <RoleRoute allowedRoles={['seller', 'admin']}>
              <SellerProductsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/seller/orders"
          element={
            <RoleRoute allowedRoles={['seller', 'admin']}>
              <SellerOrdersPage />
            </RoleRoute>
          }
        />
        <Route
          path="/seller/register"
          element={
            <RoleRoute allowedRoles={['customer', 'seller', 'admin']}>
              <SellerRegisterPage />
            </RoleRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <RoleRoute allowedRoles={['admin']}>
              <AdminDashboardPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/sellers"
          element={
            <RoleRoute allowedRoles={['admin']}>
              <AdminSellersPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/coupons"
          element={
            <RoleRoute allowedRoles={['admin']}>
              <AdminCouponsPage />
            </RoleRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <AnimatedRoutes />
        </Layout>
        <Toaster position="top-right" />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
