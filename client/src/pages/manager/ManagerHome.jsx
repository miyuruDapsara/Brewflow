import { Link } from 'react-router-dom';

const links = [
  {
    to: '/staff',
    title: 'Kitchen',
    description: 'Live order queue and status updates.',
  },
  {
    to: '/manager/inventory',
    title: 'Inventory',
    description: 'Ingredients, low stock, and adjustments.',
  },
  {
    to: '/manager/reports',
    title: 'Reports',
    description: 'Sales, popularity, and inventory summaries.',
  },
  {
    to: '/manager/audit',
    title: 'Audit',
    description: 'Append-only log of staff and manager actions.',
  },
];

export default function ManagerHome() {
  return (
    <section className="bf-page space-y-6">
      <div>
        <h1 className="bf-display text-3xl font-bold tracking-tight text-[var(--bf-ink)]">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-[var(--bf-muted)]">
          Manage kitchen, stock, and reports.
        </p>
      </div>

      <ul className="space-y-2">
        {links.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              className="block rounded-2xl border border-[var(--bf-border)] bg-white/70 px-4 py-3 transition hover:border-[var(--bf-accent)]/40"
            >
              <p className="bf-display font-bold text-[var(--bf-ink)]">
                {item.title}
              </p>
              <p className="text-sm text-[var(--bf-muted)]">{item.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
