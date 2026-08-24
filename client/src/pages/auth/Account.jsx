import useAuth from '../../hooks/useAuth';

export default function Account() {
  const { user } = useAuth();

  return (
    <section className="space-y-3 rounded-lg bg-white/80 p-6 shadow-sm ring-1 ring-stone-200">
      <h1 className="text-2xl font-semibold text-amber-950">Your account</h1>
      <p className="text-sm text-stone-600">
        Signed-in area for Phase 6. Menu and cart arrive in later phases.
      </p>
      <dl className="grid gap-2 text-sm">
        <div>
          <dt className="text-stone-500">Name</dt>
          <dd className="font-medium text-stone-900">{user?.name}</dd>
        </div>
        <div>
          <dt className="text-stone-500">Email</dt>
          <dd className="font-medium text-stone-900">{user?.email}</dd>
        </div>
        <div>
          <dt className="text-stone-500">Role</dt>
          <dd className="font-medium text-stone-900">{user?.role}</dd>
        </div>
      </dl>
    </section>
  );
}
