export default function EmptyState({ title = 'Nothing here yet', description }) {
  return (
    <div className="rounded-lg border border-dashed border-stone-300 bg-white/60 px-6 py-10 text-center">
      <h2 className="text-lg font-semibold text-stone-800">{title}</h2>
      {description ? (
        <p className="mt-2 text-sm text-stone-600">{description}</p>
      ) : null}
    </div>
  );
}
