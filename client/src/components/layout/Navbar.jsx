import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';
import { APP_NAME } from '../../utils/constants';
import Button from '../common/Button';
import CartBadge from '../cart/CartBadge';
import CartDrawer from '../cart/CartDrawer';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition duration-200 ${
      isActive
        ? 'text-[var(--bf-accent)]'
        : 'text-[var(--bf-muted)] hover:text-[var(--bf-ink)]'
    }`;

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--bf-border)] bg-[#fffaf4]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5">
        <Link
          to="/"
          className="bf-display text-xl font-bold tracking-tight text-[var(--bf-ink)] transition hover:text-[var(--bf-accent)]"
        >
          {APP_NAME}
        </Link>

        <nav className="flex flex-wrap items-center gap-3 sm:gap-4">
          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>
          <NavLink to="/menu" className={linkClass}>
            Menu
          </NavLink>
          <CartBadge count={itemCount} onClick={() => setDrawerOpen(true)} />
          {isAuthenticated ? (
            <>
              <NavLink to="/orders" className={linkClass}>
                Orders
              </NavLink>
              <NavLink to="/account" className={linkClass}>
                Account
              </NavLink>
              <span className="hidden text-sm text-[var(--bf-muted)] sm:inline">
                {user?.name}
              </span>
              <Button variant="secondary" onClick={logout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Log in
              </NavLink>
              <NavLink to="/register">
                <Button>Register</Button>
              </NavLink>
            </>
          )}
        </nav>
      </div>

      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </header>
  );
}
