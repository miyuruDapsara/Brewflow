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
    <section className="bf-page mx-auto max-w-md space-y-6">
      <div>
        <h1 className="bf-display text-2xl font-bold text-[var(--bf-ink)]">
          Log in
        </h1>
        <p className="mt-1 text-sm text-[var(--bf-muted)]">
          Welcome back. Use your BrewFlow account.
        </p>
      </div>
      <div className="bf-glass-strong rounded-2xl p-6">
        <LoginForm onSuccess={() => navigate(redirectTo, { replace: true })} />
      </div>
      <p className="text-sm text-[var(--bf-muted)]">
        New here?{' '}
        <Link
          to="/register"
          className="font-medium text-[var(--bf-accent)] underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </section>
  );
}
