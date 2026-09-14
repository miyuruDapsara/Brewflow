import { useCallback, useEffect, useState } from 'react';
import ReportFilters from '../../components/reports/ReportFilters';
import SalesSummary from '../../components/reports/SalesSummary';
import PopularProducts from '../../components/reports/PopularProducts';
import CategorySales from '../../components/reports/CategorySales';
import InventoryReport from '../../components/reports/InventoryReport';
import ErrorMessage from '../../components/common/ErrorMessage';
import Spinner from '../../components/common/Spinner';
import {
  UI_DEMO_INVENTORY_REPORT,
  UI_DEMO_PRODUCT_REPORT,
  UI_DEMO_SALES_REPORT,
} from '../../data/uiDemoData';
import {
  getInventoryReport,
  getProductReport,
  getSalesReport,
} from '../../services/report';
import { isUiDemoEnabled } from '../../utils/uiDemo';
import { getErrorMessage } from '../../utils/errorHandler';

function defaultRange() {
  const to = new Date();
  const from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
    groupBy: 'day',
  };
}

export default function Reports() {
  const [filters, setFilters] = useState(defaultRange);
  const [sales, setSales] = useState(null);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const demoMode = isUiDemoEnabled();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    if (demoMode) {
      setSales(UI_DEMO_SALES_REPORT);
      setProducts(UI_DEMO_PRODUCT_REPORT.products);
      setInventory(UI_DEMO_INVENTORY_REPORT);
      setLoading(false);
      return;
    }

    try {
      const params = {
        from: filters.from,
        to: filters.to,
        groupBy: filters.groupBy,
      };
      const [salesRes, productsRes, invRes] = await Promise.all([
        getSalesReport(params),
        getProductReport({ from: filters.from, to: filters.to }),
        getInventoryReport(),
      ]);
      setSales(salesRes.report);
      setProducts(productsRes.report?.products || []);
      setInventory(invRes.report);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load reports'));
    } finally {
      setLoading(false);
    }
  }, [demoMode, filters.from, filters.to, filters.groupBy]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section className="bf-page space-y-6">
      <div>
        <h1 className="bf-display text-3xl font-bold tracking-tight text-[var(--bf-ink)]">
          Reports
        </h1>
        <p className="mt-1 text-sm text-[var(--bf-muted)]">
          {demoMode
            ? 'UI demo charts — not from the database.'
            : 'Read-only sales, popularity, and inventory summaries for managers.'}
        </p>
      </div>

      <ReportFilters
        from={filters.from}
        to={filters.to}
        groupBy={filters.groupBy}
        loading={loading}
        onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
        onApply={load}
      />

      <ErrorMessage message={error} />

      {loading && !sales ? (
        <Spinner label="Loading reports…" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="bf-display text-lg font-bold text-[var(--bf-ink)]">
              Sales
            </h2>
            <SalesSummary
              summary={sales?.summary}
              failedPayments={sales?.failedPayments}
              cancellations={sales?.cancellations}
              series={sales?.series}
            />
            <div className="bf-glass space-y-3 rounded-2xl p-4">
              <h2 className="bf-display text-lg font-bold text-[var(--bf-ink)]">
                Category sales
              </h2>
              <CategorySales categorySales={sales?.categorySales} />
            </div>
          </div>
          <div className="space-y-6">
            <div className="bf-glass space-y-3 rounded-2xl p-4">
              <h2 className="bf-display text-lg font-bold text-[var(--bf-ink)]">
                Popular products
              </h2>
              <PopularProducts products={products} />
            </div>
            <div className="bf-glass space-y-3 rounded-2xl p-4">
              <h2 className="bf-display text-lg font-bold text-[var(--bf-ink)]">
                Inventory
              </h2>
              <InventoryReport report={inventory} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
