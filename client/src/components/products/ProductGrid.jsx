import EmptyState from '../common/EmptyState';
import ProductCard from './ProductCard';

export default function ProductGrid({ products = [] }) {
  if (!products.length) {
    return (
      <EmptyState
        title="No products to show"
        description="Try another category or search, or check back when the menu is updated."
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
