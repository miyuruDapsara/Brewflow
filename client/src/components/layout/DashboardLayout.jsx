import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { APP_NAME, ROLES } from '../../utils/constants';
import Button from '../common/Button';
import UiDemoBanner from '../common/UiDemoBanner';

const linkClass = ({ isActive }) =>
  `block rounded-xl px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-[var(--bf-accent)] text-white'
      : 'text-[var(--bf-muted)] hover:bg-white/70 hover:text-[var(--bf-ink)]'
  }`;

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [navOpen, setNavOpen] = useState(false);
  const isManager = user?.role === ROLES.MANAGER;

  const nav = (
    <nav className="flex flex-col gap-1 p-3" aria-label="Ops navigation">
      <NavLink
        to="/staff"
        className={linkClass}
        onClick={() => setNavOpen(false)}
      >
        Kitchen
      </NavLink>
      {isManager ? (
        <>
          <NavLink
            to="/manager"
            end
            className={linkClass}
            onClick={() => setNavOpen(false)}
          >
            Home
          </NavLink>
          <NavLink
            to="/manager/inventory"
            className={linkClass}
            onClick={() => setNavOpen(false)}
          >
            Inventory
          </NavLink>
          <NavLink
            to="/manager/reports"
            className={linkClass}
            onClick={() => setNavOpen(false)}
          >
            Reports
          </NavLink>
          <NavLink
            to="/manager/audit"
            className={linkClass}
            onClick={() => setNavOpen(false)}
          >
            Audit
          </NavLink>
        </>
      ) : null}
    </nav>
  );

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bf-cream)]">
      <header className="sticky top-0 z-30 border-b border-[var(--bf-border)] bg-[#fffaf4]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg border border-[var(--bf-border)] px-2 py-1 text-sm text-[var(--bf-ink)] lg:hidden"
              onClick={() => setNavOpen((o) => !o)}
              aria-expanded={navOpen}
              aria-label="Toggle ops menu"
            >
              Menu
            </button>
            <Link
              to={isManager ? '/manager' : '/staff'}
              className="bf-display text-lg font-bold tracking-tight text-[var(--bf-ink)]"
            >
              {APP_NAME}{' '}
              <span className="font-medium text-[var(--bf-muted)]">Ops</span>
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link
              to="/"
              className="text-sm font-medium text-[var(--bf-accent)] underline-offset-4 hover:underline"
            >
              View storefront
            </Link>
            <span className="hidden text-sm text-[var(--bf-muted)] sm:inline">
              {user?.name}
            </span>
            <Button variant="secondary" onClick={logout}>
              Log out
            </Button>
          </div>
        </div>
      </header>
      <UiDemoBanner />

      <div className="mx-auto flex w-full max-w-6xl flex-1">
        <aside className="hidden w-56 shrink-0 border-r border-[var(--bf-border)] bg-[#f7efe4]/80 lg:block">
          {nav}
        </aside>
        {navOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/30"
              aria-label="Close menu"
              onClick={() => setNavOpen(false)}
            />
            <aside className="relative z-10 h-full w-64 bg-[#fffaf4] shadow-lg">
              {nav}
            </aside>
          </div>
        ) : null}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
