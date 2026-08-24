export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
  onClick,
}) {
  const variants = {
    primary: 'bg-amber-800 text-white hover:bg-amber-900',
    secondary: 'bg-stone-200 text-stone-800 hover:bg-stone-300',
    ghost: 'bg-transparent text-amber-900 hover:bg-amber-100',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </button>
  );
}
