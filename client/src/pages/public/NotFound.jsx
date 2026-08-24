import { Link } from 'react-router-dom';
import EmptyState from '../../components/common/EmptyState';

export default function NotFound() {
  return (
    <EmptyState
      title="Page not found"
      description={
        <>
          That route does not exist.{' '}
          <Link to="/" className="font-medium text-amber-900 underline">
            Back home
          </Link>
        </>
      }
    />
  );
}
