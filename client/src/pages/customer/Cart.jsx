import { Link } from 'react-router-dom';
import CartItem from '../../components/cart/CartItem';
import CartSummary from '../../components/cart/CartSummary';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import useCart from '../../hooks/useCart';

export default function Cart() {
  const { items, itemCount, subtotal, updateQuantity, removeItem, clearCart } =
    useCart();

  if (!items.length) {
    return (
      <section className="bf-page space-y-4">
        <h1 className="bf-display text-3xl font-bold tracking-tight text-[var(--bf-ink)]">
          Cart
        </h1>
        <EmptyState
          title="Your cart is empty"
          description="Browse the menu to add drinks and food."
        />
        <Link to="/menu">
          <Button>Browse menu</Button>
        </Link>
      </section>
    );
  }

  return (
    <section className="bf-page mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="bf-display text-3xl font-bold tracking-tight text-[var(--bf-ink)]">
          Cart
        </h1>
        <Button variant="ghost" onClick={clearCart}>
          Clear cart
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <CartItem
            key={item.lineId}
            item={item}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
          />
        ))}
      </div>

      <CartSummary subtotal={subtotal} itemCount={itemCount} />

      <div className="flex flex-wrap gap-3">
        <Link to="/checkout">
          <Button>Checkout</Button>
        </Link>
        <Link to="/menu">
          <Button variant="secondary">Continue shopping</Button>
        </Link>
      </div>

      <p className="text-xs text-[var(--bf-muted)]">
        You must be signed in to place an order. Final totals are calculated on
        the server.
      </p>
    </section>
  );
}
