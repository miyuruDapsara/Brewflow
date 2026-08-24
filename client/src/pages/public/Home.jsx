import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { APP_NAME } from '../../utils/constants';
import Button from '../../components/common/Button';

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-800/80">
          Café operations
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-amber-950 sm:text-5xl">
          {APP_NAME}
        </h1>
        <p className="max-w-xl text-base text-stone-600">
          Order coffee and snacks online. Staff prepare in real time. Managers
          run the menu — foundation ready for the next build phases.
        </p>
      </div>

      {isAuthenticated ? (
        <div className="rounded-lg bg-white/70 p-4 shadow-sm ring-1 ring-stone-200">
          <p className="text-sm text-stone-600">Signed in as</p>
          <p className="text-lg font-medium text-stone-900">
            {user?.name}{' '}
            <span className="text-sm font-normal text-stone-500">({user?.role})</span>
          </p>
          <div className="mt-4">
            <Link to="/account">
              <Button variant="secondary">Go to account</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          <Link to="/register">
            <Button>Create account</Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary">Log in</Button>
          </Link>
        </div>
      )}
    </section>
  );
}
