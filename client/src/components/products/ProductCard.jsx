import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';

export default function ProductCard({ product }) {
  const available = product?.isCurrentlyAvailable !== false;

  return (
    <Link
      to={`/products/${product.id}`}
      className="block rounded-lg bg-white/80 p-4 shadow-sm ring-1 ring-stone-200 transition hover:ring-amber-700/40"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-amber-950">{product.name}</h3>
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
      <p className="mt-1 text-sm text-stone-500">{product.productType}</p>
      <p className="mt-3 text-base font-medium text-stone-900">
        {formatCurrency(product.basePrice)}
      </p>
    </Link>
  );
}
