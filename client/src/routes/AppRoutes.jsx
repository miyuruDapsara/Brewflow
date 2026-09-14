import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import RoleGuard from '../components/auth/RoleGuard';
import MainLayout from '../components/layout/MainLayout';
import DashboardLayout from '../components/layout/DashboardLayout';
import Account from '../pages/auth/Account';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Unauthorized from '../pages/auth/Unauthorized';
import About from '../pages/public/About';
import Home from '../pages/public/Home';
import Menu from '../pages/public/Menu';
import NotFound from '../pages/public/NotFound';
import ProductDetails from '../pages/public/ProductDetails';
import Cart from '../pages/customer/Cart';
import Checkout from '../pages/customer/Checkout';
import CheckoutReturn from '../pages/customer/CheckoutReturn';
import CheckoutCancel from '../pages/customer/CheckoutCancel';
import OrderDetails from '../pages/customer/OrderDetails';
import OrderHistory from '../pages/customer/OrderHistory';
import StaffDashboard from '../pages/staff/StaffDashboard';
import ManagerHome from '../pages/manager/ManagerHome';
import Inventory from '../pages/manager/Inventory';
import Reports from '../pages/manager/Reports';
import AuditLog from '../pages/manager/AuditLog';
import { ROLES } from '../utils/constants';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
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
          path="/checkout/return"
          element={
            <ProtectedRoute>
              <CheckoutReturn />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout/cancel"
          element={
            <ProtectedRoute>
              <CheckoutCancel />
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
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <RoleGuard roles={[ROLES.STAFF, ROLES.MANAGER]}>
              <DashboardLayout />
            </RoleGuard>
          </ProtectedRoute>
        }
      >
        <Route path="/staff" element={<StaffDashboard />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <RoleGuard roles={[ROLES.MANAGER]}>
              <DashboardLayout />
            </RoleGuard>
          </ProtectedRoute>
        }
      >
        <Route path="/manager" element={<ManagerHome />} />
        <Route path="/manager/inventory" element={<Inventory />} />
        <Route path="/manager/reports" element={<Reports />} />
        <Route path="/manager/audit" element={<AuditLog />} />
      </Route>
    </Routes>
  );
}
