import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import RoleGuard from '../components/auth/RoleGuard';
import MainLayout from '../components/layout/MainLayout';
import Account from '../pages/auth/Account';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Unauthorized from '../pages/auth/Unauthorized';
import Home from '../pages/public/Home';
import NotFound from '../pages/public/NotFound';
import { ROLES } from '../utils/constants';

function ManagerPlaceholder() {
  return (
    <section className="rounded-lg bg-white/80 p-6 ring-1 ring-stone-200">
      <h1 className="text-xl font-semibold text-amber-950">Manager area</h1>
      <p className="mt-2 text-sm text-stone-600">
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
