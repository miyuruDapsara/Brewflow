export default function StockBadge({ quantity, reorderLevel }) {
  const low = Number(quantity) <= Number(reorderLevel);
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
        low
          ? 'bg-red-50 text-red-800'
          : 'bg-emerald-50 text-emerald-800'
      }`}
    >
      {low ? 'Low' : 'OK'} · {quantity}
    </span>
  );
}
