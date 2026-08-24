import { Link } from 'react-router-dom';
import useCart from '../../hooks/useCart';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';
import CartItem from './CartItem';
import CartSummary from './CartSummary';

export default function CartDrawer({ open, onClose }) {
  const { items, itemCount, subtotal, updateQuantity, removeItem } = useCart();

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-label="Cart drawer">
      <button
        type="button"
        className="absolute inset-0 bg-[var(--bf-ink)]/40 backdrop-blur-sm"
        aria-label="Close cart"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#fffaf4] shadow-2xl ring-1 ring-[var(--bf-border)]">
        <div className="flex items-center justify-between border-b border-[var(--bf-border)] px-4 py-3">
          <h2 className="bf-display text-lg font-bold text-[var(--bf-ink)]">
            Your cart
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-[var(--bf-muted)] hover:bg-[var(--bf-bg)]"
          >
            Close
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {items.length === 0 ? (
            <EmptyState
              title="Cart is empty"
              description="Browse the menu and add something you like."
            />
          ) : (
            items.map((item) => (
              <CartItem
                key={item.lineId}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))
          )}
        </div>

        <div className="space-y-3 border-t border-[var(--bf-border)] px-4 py-4">
          <CartSummary subtotal={subtotal} itemCount={itemCount} />
          <Link to="/cart" onClick={onClose} className="block">
            <Button className="w-full">View cart</Button>
          </Link>
        </div>
      </aside>
    </div>
  );
}
