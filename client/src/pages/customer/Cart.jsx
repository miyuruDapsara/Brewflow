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
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-amber-950">
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
    <section className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-amber-950">
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

      <div className="rounded-lg border border-dashed border-stone-300 bg-white/60 p-4 text-sm text-stone-600">
        Checkout and place order come in the next phase. Your cart is saved in
        this browser for now.
      </div>

      <Link to="/menu">
        <Button variant="secondary">Continue shopping</Button>
      </Link>
    </section>
  );
}
