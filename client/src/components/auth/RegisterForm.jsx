import { useState } from 'react';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';
import Input from '../common/Input';
import useAuth from '../../hooks/useAuth';
import { getErrorMessage } from '../../utils/errorHandler';

export default function RegisterForm({ onSuccess }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await register({ name, email, password });
      onSuccess?.();
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to register'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="register-name"
        label="Name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
        autoComplete="name"
      />
      <Input
        id="register-email"
        label="Email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        autoComplete="email"
      />
      <Input
        id="register-password"
        label="Password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        autoComplete="new-password"
      />
      <ErrorMessage message={error} />
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? 'Creating account...' : 'Create account'}
      </Button>
    </form>
  );
}
