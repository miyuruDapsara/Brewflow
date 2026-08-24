import { useEffect, useMemo, useState } from 'react';
import CategoryTabs from '../../components/products/CategoryTabs';
import ProductFilters from '../../components/products/ProductFilters';
import ProductGrid from '../../components/products/ProductGrid';
import ErrorMessage from '../../components/common/ErrorMessage';
import Spinner from '../../components/common/Spinner';
import { listCategories } from '../../services/category';
import { listProducts } from '../../services/product';
import { getErrorMessage } from '../../utils/errorHandler';

export default function Menu() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const data = await listCategories();
        if (!cancelled) {
          setCategories(data.categories || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, 'Unable to load categories'));
        }
      }
    }

    loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setLoading(true);
      setError('');
      try {
        const data = await listProducts({
          categoryId: selectedCategoryId || undefined,
        });
        if (!cancelled) {
          setProducts(data.products || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, 'Unable to load products'));
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, [selectedCategoryId]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return products;
    }
    return products.filter((product) =>
      product.name.toLowerCase().includes(query)
    );
  }, [products, search]);

  return (
    <section className="bf-page space-y-6">
      <div className="space-y-2">
        <h1 className="bf-display text-3xl font-bold tracking-tight text-[var(--bf-ink)] sm:text-4xl">
          Menu
        </h1>
        <p className="text-sm text-[var(--bf-muted)]">
          Browse drinks and food. Open a product for details and customization
          options.
        </p>
      </div>

      <CategoryTabs
        categories={categories}
        selectedId={selectedCategoryId}
        onChange={setSelectedCategoryId}
      />

      <ProductFilters value={search} onChange={setSearch} />

      <ErrorMessage message={error} />

      {loading ? (
        <Spinner label="Loading menu..." />
      ) : (
        <ProductGrid products={filteredProducts} />
      )}
    </section>
  );
}
