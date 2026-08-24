export default function CategoryTabs({
  categories = [],
  selectedId = null,
  onChange,
}) {
  const tabs = [{ id: null, name: 'All' }, ...categories];

  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Categories">
      {tabs.map((tab) => {
        const isActive = selectedId === tab.id;
        return (
          <button
            key={tab.id ?? 'all'}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange?.(tab.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition duration-200 ${
              isActive
                ? 'bg-[var(--bf-accent)] text-white shadow-sm'
                : 'bg-white text-[var(--bf-muted)] ring-1 ring-[var(--bf-border)] hover:text-[var(--bf-ink)]'
            }`}
          >
            {tab.name}
          </button>
        );
      })}
    </div>
  );
}
