export default function Input({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  autoComplete,
}) {
  return (
    <label className="block space-y-1.5 text-sm" htmlFor={id}>
      {label ? (
        <span className="font-medium text-[var(--bf-muted)]">{label}</span>
      ) : null}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-[var(--bf-border)] bg-white px-3 py-2.5 text-[var(--bf-ink)] placeholder:text-stone-400 outline-none transition focus:border-[var(--bf-accent)] focus:ring-2 focus:ring-[var(--bf-accent)]/20"
      />
    </label>
  );
}
