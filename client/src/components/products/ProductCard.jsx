import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';
import { PRODUCT_IMAGE_PLACEHOLDER } from '../../data/demoContent';

export default function ProductCard({ product }) {
  const available = product?.isCurrentlyAvailable !== false;
  const imageSrc = product?.imageUrl || PRODUCT_IMAGE_PLACEHOLDER;

  return (
    <Link
      to={`/products/${product.id}`}
      className="bf-card group block overflow-hidden"
    >
      <div className="aspect-[4/3] overflow-hidden bg-[var(--bf-placeholder)]">
        <img
          src={imageSrc}
          alt={product.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="bf-display text-lg font-bold text-[var(--bf-ink)]">
            {product.name}
          </h3>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
              available
                ? 'bg-emerald-50 text-emerald-800'
                : 'bg-stone-100 text-stone-500'
            }`}
          >
            {available ? 'Available' : 'Unavailable'}
          </span>
        </div>
        <p className="mt-1 text-sm text-[var(--bf-muted)]">{product.productType}</p>
        <p className="mt-3 text-base font-semibold text-[var(--bf-accent)]">
          {formatCurrency(product.basePrice)}
        </p>
      </div>
    </Link>
  );
}
