export default function ProductFilters({ value, onChange, placeholder = 'Search menu...' }) {
  return (
    <label className="block w-full max-w-sm text-sm" htmlFor="menu-search">
      <span className="sr-only">Search products</span>
      <input
        id="menu-search"
        type="search"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none ring-amber-700 focus:ring-2"
      />
    </label>
  );
}
