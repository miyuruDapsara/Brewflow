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
    <label className="block space-y-1 text-sm" htmlFor={id}>
      {label ? <span className="font-medium text-stone-700">{label}</span> : null}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none ring-amber-700 focus:ring-2"
      />
    </label>
  );
}
