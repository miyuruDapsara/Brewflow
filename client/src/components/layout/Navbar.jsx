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
    `text-sm font-medium ${isActive ? 'text-amber-900' : 'text-stone-600 hover:text-amber-800'}`;

  return (
    <header className="border-b border-stone-200/80 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link to="/" className="text-xl font-semibold tracking-tight text-amber-950">
          {APP_NAME}
        </Link>

        <nav className="flex items-center gap-4">
          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>
          <NavLink to="/menu" className={linkClass}>
            Menu
          </NavLink>
          <CartBadge count={itemCount} onClick={() => setDrawerOpen(true)} />
          {isAuthenticated ? (
            <>
              <NavLink to="/account" className={linkClass}>
                Account
              </NavLink>
              <span className="hidden text-sm text-stone-500 sm:inline">
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
