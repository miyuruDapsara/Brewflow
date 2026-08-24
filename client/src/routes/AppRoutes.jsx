import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import RoleGuard from '../components/auth/RoleGuard';
import MainLayout from '../components/layout/MainLayout';
import Account from '../pages/auth/Account';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Unauthorized from '../pages/auth/Unauthorized';
import Home from '../pages/public/Home';
import Menu from '../pages/public/Menu';
import NotFound from '../pages/public/NotFound';
import ProductDetails from '../pages/public/ProductDetails';
import Cart from '../pages/customer/Cart';
import Checkout from '../pages/customer/Checkout';
import OrderDetails from '../pages/customer/OrderDetails';
import OrderHistory from '../pages/customer/OrderHistory';
import { ROLES } from '../utils/constants';

function ManagerPlaceholder() {
  return (
    <section className="bf-page bf-glass-strong rounded-2xl p-6">
      <h1 className="bf-display text-xl font-bold text-[var(--bf-ink)]">
        Manager area
      </h1>
      <p className="mt-2 text-sm text-[var(--bf-muted)]">
        Placeholder route for role checks. Full manager UI comes later.
      </p>
    </section>
  );
}

export default function AppRoutes() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrderHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetails />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager"
          element={
            <ProtectedRoute>
              <RoleGuard roles={[ROLES.MANAGER]}>
                <ManagerPlaceholder />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MainLayout>
  );
}
