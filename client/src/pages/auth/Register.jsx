import { Link, Navigate, useNavigate } from 'react-router-dom';
import RegisterForm from '../../components/auth/RegisterForm';
import useAuth from '../../hooks/useAuth';

export default function Register() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  if (!loading && isAuthenticated) {
    return <Navigate to="/account" replace />;
  }

  return (
    <section className="bf-page mx-auto max-w-md space-y-6">
      <div>
        <h1 className="bf-display text-2xl font-bold text-[var(--bf-ink)]">
          Create account
        </h1>
        <p className="mt-1 text-sm text-[var(--bf-muted)]">
          Register as a customer to start ordering.
        </p>
      </div>
      <div className="bf-glass-strong rounded-2xl p-6">
        <RegisterForm onSuccess={() => navigate('/account', { replace: true })} />
      </div>
      <p className="text-sm text-[var(--bf-muted)]">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-medium text-[var(--bf-accent)] underline-offset-4 hover:underline"
        >
          Log in
        </Link>
      </p>
    </section>
  );
}
