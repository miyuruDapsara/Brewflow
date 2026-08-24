import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';
import useAuth from '../../hooks/useAuth';

export default function Login() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/account';

  if (!loading && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <section className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-amber-950">Log in</h1>
        <p className="mt-1 text-sm text-stone-600">
          Welcome back. Use your BrewFlow account.
        </p>
      </div>
      <div className="rounded-lg bg-white/80 p-6 shadow-sm ring-1 ring-stone-200">
        <LoginForm onSuccess={() => navigate(redirectTo, { replace: true })} />
      </div>
      <p className="text-sm text-stone-600">
        New here?{' '}
        <Link to="/register" className="font-medium text-amber-900 underline">
          Create an account
        </Link>
      </p>
    </section>
  );
}
