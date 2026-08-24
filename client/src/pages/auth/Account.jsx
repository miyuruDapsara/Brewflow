import useAuth from '../../hooks/useAuth';

export default function Account() {
  const { user } = useAuth();

  return (
    <section className="bf-page bf-glass-strong space-y-4 rounded-2xl p-6">
      <h1 className="bf-display text-2xl font-bold text-[var(--bf-ink)]">
        Your account
      </h1>
      <p className="text-sm text-[var(--bf-muted)]">
        Manage your BrewFlow profile and continue ordering from the menu.
      </p>
      <dl className="grid gap-3 text-sm">
        <div>
          <dt className="text-[var(--bf-muted)]">Name</dt>
          <dd className="font-medium text-[var(--bf-ink)]">{user?.name}</dd>
        </div>
        <div>
          <dt className="text-[var(--bf-muted)]">Email</dt>
          <dd className="font-medium text-[var(--bf-ink)]">{user?.email}</dd>
        </div>
        <div>
          <dt className="text-[var(--bf-muted)]">Role</dt>
          <dd className="font-medium text-[var(--bf-accent)]">{user?.role}</dd>
        </div>
      </dl>
    </section>
  );
}
