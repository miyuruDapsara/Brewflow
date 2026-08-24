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
    <section className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-amber-950">Create account</h1>
        <p className="mt-1 text-sm text-stone-600">
          Register as a customer to start ordering.
        </p>
      </div>
      <div className="rounded-lg bg-white/80 p-6 shadow-sm ring-1 ring-stone-200">
        <RegisterForm onSuccess={() => navigate('/account', { replace: true })} />
      </div>
      <p className="text-sm text-stone-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-amber-900 underline">
          Log in
        </Link>
      </p>
    </section>
  );
}
