const STEPS = ['PLACED', 'PREPARING', 'READY', 'COMPLETED'];

export default function OrderStatusTimeline({ status }) {
  if (status === 'CANCELLED') {
    return (
      <p className="text-sm text-red-700">This order was cancelled.</p>
    );
  }

  const currentIndex = STEPS.indexOf(status);

  return (
    <ol className="flex flex-wrap gap-2">
      {STEPS.map((step, index) => {
        const done = currentIndex >= 0 && index <= currentIndex;
        return (
          <li
            key={step}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              done
                ? 'bg-[var(--bf-accent)] text-white'
                : 'bg-[var(--bf-cream)] text-[var(--bf-muted)]'
            }`}
          >
            {step}
          </li>
        );
      })}
    </ol>
  );
}
