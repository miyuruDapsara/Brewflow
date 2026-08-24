export default function ProductFilters({
  value,
  onChange,
  placeholder = 'Search menu...',
}) {
  return (
    <label className="block w-full max-w-sm text-sm" htmlFor="menu-search">
      <span className="sr-only">Search products</span>
      <input
        id="menu-search"
        type="search"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[var(--bf-border)] bg-white px-3 py-2.5 text-[var(--bf-ink)] outline-none transition focus:border-[var(--bf-accent)] focus:ring-2 focus:ring-[var(--bf-accent)]/20"
      />
    </label>
  );
}
