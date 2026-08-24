import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import ErrorMessage from '../../components/common/ErrorMessage';
import Spinner from '../../components/common/Spinner';
import ProductModifierModal from '../../components/products/ProductModifierModal';
import useCart from '../../hooks/useCart';
import { PRODUCT_IMAGE_PLACEHOLDER } from '../../data/demoContent';
import { getProduct } from '../../services/product';
import { formatCurrency } from '../../utils/formatCurrency';
import { getErrorMessage } from '../../utils/errorHandler';

export default function ProductDetails() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [addedMessage, setAddedMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await getProduct(id);
        if (!cancelled) {
          setProduct(data.product);
        }
      } catch (err) {
        if (!cancelled) {
          setProduct(null);
          setError(getErrorMessage(err, 'Product not found'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (id) {
      load();
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  function handleAddToCartClick() {
    if (!product || product.isCurrentlyAvailable === false) {
      return;
    }

    if (product.modifierGroups?.length) {
      setModalOpen(true);
      return;
    }

    try {
      addItem({
        product,
        selectedModifiers: [],
        quantity: 1,
      });
      setAddedMessage('Added to cart');
    } catch (err) {
      setError(err.message || 'Unable to add to cart');
    }
  }

  function handleModalAdd(payload) {
    addItem(payload);
    setAddedMessage('Added to cart');
  }

  if (loading) {
    return <Spinner label="Loading product..." />;
  }

  if (error || !product) {
    return (
      <div className="space-y-4">
        <ErrorMessage message={error || 'Product not found'} />
        <Link to="/menu">
          <Button variant="secondary">Back to menu</Button>
        </Link>
      </div>
    );
  }

  const available = product.isCurrentlyAvailable !== false;
  const imageSrc = product.imageUrl || PRODUCT_IMAGE_PLACEHOLDER;

  return (
    <section className="bf-page mx-auto max-w-2xl space-y-6">
      <Link
        to="/menu"
        className="text-sm font-medium text-[var(--bf-accent)] underline-offset-4 transition hover:underline"
      >
        Back to menu
      </Link>

      <div className="bf-glass-strong overflow-hidden rounded-2xl">
        <div className="aspect-[21/9] bg-[var(--bf-placeholder)]">
          <img
            src={imageSrc}
            alt={product.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.src = PRODUCT_IMAGE_PLACEHOLDER;
            }}
          />
        </div>
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="bf-display text-3xl font-bold text-[var(--bf-ink)]">
                {product.name}
              </h1>
              <p className="mt-1 text-sm text-[var(--bf-muted)]">
                {product.productType}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                available
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'bg-stone-100 text-stone-500'
              }`}
            >
              {available ? 'Available' : 'Unavailable'}
            </span>
          </div>

          <p className="mt-4 text-2xl font-semibold text-[var(--bf-accent)]">
            {formatCurrency(product.basePrice)}
          </p>

          <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[var(--bf-muted)]">Inventory mode</dt>
              <dd className="font-medium text-[var(--bf-ink)]">
                {product.inventoryMode}
              </dd>
            </div>
            {product.inventoryMode === 'STOCK_BASED' ? (
              <div>
                <dt className="text-[var(--bf-muted)]">Stock</dt>
                <dd className="font-medium text-[var(--bf-ink)]">
                  {product.stockQuantity}
                </dd>
              </div>
            ) : null}
          </dl>

          {!available ? (
            <p className="mt-4 rounded-lg border border-[var(--bf-border)] bg-[var(--bf-cream)] px-3 py-2 text-sm text-[var(--bf-muted)]">
              This item is currently unavailable for ordering.
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button disabled={!available} onClick={handleAddToCartClick}>
              {product.modifierGroups?.length
                ? 'Customize & add'
                : 'Add to cart'}
            </Button>
            {addedMessage ? (
              <span className="text-sm font-medium text-[var(--bf-accent)]">
                {addedMessage}
              </span>
            ) : null}
          </div>

          {product.modifierGroups?.length ? (
            <div className="mt-8 space-y-4">
              <h2 className="bf-display text-lg font-bold text-[var(--bf-ink)]">
                Customization options
              </h2>
              <p className="text-sm text-[var(--bf-muted)]">
                Choose size, milk, and add-ons when you add this item to your
                cart.
              </p>
              {product.modifierGroups.map((group) => (
                <div
                  key={group.id}
                  className="rounded-xl border border-[var(--bf-border)] bg-[var(--bf-cream)]/60 p-4"
                >
                  <h3 className="font-medium text-[var(--bf-ink)]">
                    {group.name}
                    {group.isRequired ? (
                      <span className="ml-2 text-xs text-[var(--bf-accent)]">
                        Required
                      </span>
                    ) : null}
                  </h3>
                  <ul className="mt-2 space-y-1 text-sm text-[var(--bf-muted)]">
                    {(group.options || []).map((option) => (
                      <li
                        key={option.id}
                        className="flex justify-between gap-4"
                      >
                        <span>{option.name}</span>
                        <span className="text-[var(--bf-accent)]">
                          {option.priceAdjustment
                            ? `+${formatCurrency(option.priceAdjustment)}`
                            : 'Included'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <ProductModifierModal
        open={modalOpen}
        product={product}
        onClose={() => setModalOpen(false)}
        onAdd={handleModalAdd}
      />
    </section>
  );
}
