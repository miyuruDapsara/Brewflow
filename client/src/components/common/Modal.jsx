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
      className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white shadow-xl ring-1 ring-stone-200"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-stone-200 px-4 py-3">
          <h2 className="text-lg font-semibold text-amber-950">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-stone-500 hover:bg-stone-100 hover:text-stone-800"
            aria-label="Close"
          >
            Close
          </button>
        </div>
        <div className="px-4 py-4">{children}</div>
        {footer ? (
          <div className="border-t border-stone-200 px-4 py-3">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
