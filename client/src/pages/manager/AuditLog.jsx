import { useCallback, useEffect, useState } from 'react';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import Spinner from '../../components/common/Spinner';
import { listAuditLogs } from '../../services/audit';
import { getErrorMessage } from '../../utils/errorHandler';

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listAuditLogs({ page: 1, limit: 50 });
      setLogs(data.logs || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load audit log'));
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section className="bf-page space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="bf-display text-3xl font-bold tracking-tight text-[var(--bf-ink)]">
            Audit log
          </h1>
          <p className="mt-1 text-sm text-[var(--bf-muted)]">
            Append-only record of manager and staff mutations. Read-only.
          </p>
        </div>
        <Button variant="secondary" onClick={load} disabled={loading}>
          Refresh
        </Button>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <Spinner label="Loading audit log…" />
      ) : logs.length === 0 ? (
        <EmptyState
          title="No audit entries"
          description="Product, category, inventory, and staff cancel actions will appear here."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--bf-border)] bg-white/70">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--bf-border)] text-[var(--bf-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Entity</th>
                <th className="px-4 py-3 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-[var(--bf-border)]/60 last:border-0"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-[var(--bf-muted)]">
                    {log.createdAt
                      ? new Date(log.createdAt).toLocaleString()
                      : '—'}
                  </td>
                  <td className="px-4 py-3 font-medium text-[var(--bf-ink)]">
                    {log.action}
                  </td>
                  <td className="px-4 py-3 text-[var(--bf-muted)]">
                    {log.entityType} · {log.entityId}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-[var(--bf-muted)]">
                    {log.details ? JSON.stringify(log.details) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pagination ? (
            <p className="border-t border-[var(--bf-border)] px-4 py-2 text-xs text-[var(--bf-muted)]">
              Showing {logs.length} of {pagination.total} entries
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}
