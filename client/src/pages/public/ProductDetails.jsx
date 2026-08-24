import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import ErrorMessage from '../../components/common/ErrorMessage';
import Spinner from '../../components/common/Spinner';
import ProductModifierModal from '../../components/products/ProductModifierModal';
import useCart from '../../hooks/useCart';
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

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <Link to="/menu" className="text-sm font-medium text-amber-900 underline">
        Back to menu
      </Link>

      <div className="rounded-lg bg-white/80 p-6 shadow-sm ring-1 ring-stone-200">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-amber-950">
              {product.name}
            </h1>
            <p className="mt-1 text-sm text-stone-500">{product.productType}</p>
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

        <p className="mt-4 text-2xl font-medium text-stone-900">
          {formatCurrency(product.basePrice)}
        </p>

        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-stone-500">Inventory mode</dt>
            <dd className="font-medium text-stone-900">{product.inventoryMode}</dd>
          </div>
          {product.inventoryMode === 'STOCK_BASED' ? (
            <div>
              <dt className="text-stone-500">Stock</dt>
              <dd className="font-medium text-stone-900">
                {product.stockQuantity}
              </dd>
            </div>
          ) : null}
        </dl>

        {!available ? (
          <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
            This item is currently unavailable for ordering.
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button disabled={!available} onClick={handleAddToCartClick}>
            {product.modifierGroups?.length ? 'Customize & add' : 'Add to cart'}
          </Button>
          {addedMessage ? (
            <span className="text-sm text-emerald-700">{addedMessage}</span>
          ) : null}
        </div>

        {product.modifierGroups?.length ? (
          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-semibold text-amber-950">
              Customization options
            </h2>
            <p className="text-sm text-stone-500">
              Choose size, milk, and add-ons when you add this item to your cart.
            </p>
            {product.modifierGroups.map((group) => (
              <div
                key={group.id}
                className="rounded-md border border-stone-200 bg-stone-50/80 p-4"
              >
                <h3 className="font-medium text-stone-900">
                  {group.name}
                  {group.isRequired ? (
                    <span className="ml-2 text-xs text-amber-800">Required</span>
                  ) : null}
                </h3>
                <ul className="mt-2 space-y-1 text-sm text-stone-700">
                  {(group.options || []).map((option) => (
                    <li key={option.id} className="flex justify-between gap-4">
                      <span>{option.name}</span>
                      <span className="text-stone-500">
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

      <ProductModifierModal
        open={modalOpen}
        product={product}
        onClose={() => setModalOpen(false)}
        onAdd={handleModalAdd}
      />
    </section>
  );
}
