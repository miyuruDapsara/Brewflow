export default function CartBadge({ count = 0, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative rounded-full px-2.5 py-1 text-sm font-medium text-[var(--bf-muted)] transition hover:bg-[var(--bf-bg)] hover:text-[var(--bf-ink)]"
      aria-label={`Cart, ${count} items`}
    >
      Cart
      {count > 0 ? (
        <span className="ml-1 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-[var(--bf-accent)] px-1.5 text-xs font-bold text-white">
          {count > 99 ? '99+' : count}
        </span>
      ) : null}
    </button>
  );
}
