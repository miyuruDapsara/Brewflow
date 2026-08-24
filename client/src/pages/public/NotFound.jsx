import { Link } from 'react-router-dom';
import EmptyState from '../../components/common/EmptyState';

export default function NotFound() {
  return (
    <div className="bf-page">
      <EmptyState
        title="Page not found"
        description={
          <>
            That route does not exist.{' '}
            <Link
              to="/"
              className="font-medium text-[var(--bf-accent)] underline-offset-4 hover:underline"
            >
              Back home
            </Link>
          </>
        }
      />
    </div>
  );
}
