export default function Spinner({ label = 'Loading...' }) {
  return (
    <div className="flex items-center gap-3 text-sm text-stone-600" role="status">
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-amber-800 border-t-transparent" />
      <span>{label}</span>
    </div>
  );
}
