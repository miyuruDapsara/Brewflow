import { Link } from 'react-router-dom';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';

export default function Unauthorized() {
  return (
    <div className="space-y-4">
      <EmptyState
        title="Unauthorized"
        description="You do not have permission to view that page."
      />
      <Link to="/">
        <Button variant="secondary">Back home</Button>
      </Link>
    </div>
  );
}
