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
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              isActive
                ? 'bg-amber-800 text-white'
                : 'bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-amber-50'
            }`}
          >
            {tab.name}
          </button>
        );
      })}
    </div>
  );
}
