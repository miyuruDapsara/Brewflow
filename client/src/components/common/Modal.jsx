export default function Modal({
  open,
  title,
  onClose,
  children,
  footer = null,
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--bf-ink)]/40 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="bf-glass-strong max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[var(--bf-border)] px-4 py-3">
          <h2 className="bf-display text-lg font-bold text-[var(--bf-ink)]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-[var(--bf-muted)] transition hover:bg-[var(--bf-bg)] hover:text-[var(--bf-ink)]"
            aria-label="Close"
          >
            Close
          </button>
        </div>
        <div className="px-4 py-4">{children}</div>
        {footer ? (
          <div className="border-t border-[var(--bf-border)] px-4 py-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
