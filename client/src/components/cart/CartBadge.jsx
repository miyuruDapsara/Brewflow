export default function CartBadge({ count = 0, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative rounded-md px-2 py-1 text-sm font-medium text-stone-700 hover:bg-amber-50 hover:text-amber-900"
      aria-label={`Cart, ${count} items`}
    >
      Cart
      {count > 0 ? (
        <span className="ml-1 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-amber-800 px-1.5 text-xs text-white">
          {count > 99 ? '99+' : count}
        </span>
      ) : null}
    </button>
  );
}
