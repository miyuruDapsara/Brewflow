export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
  onClick,
}) {
  const variants = {
    primary:
      'bg-[var(--bf-accent)] text-[#fffaf4] hover:bg-[#5a3e2c] shadow-sm',
    secondary:
      'bg-white text-[var(--bf-ink)] border border-[var(--bf-border)] hover:bg-[#f3ebe0]',
    ghost:
      'bg-transparent text-[var(--bf-accent)] hover:bg-[var(--bf-accent)]/10',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-full px-5 py-2.5 text-sm font-semibold tracking-wide transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </button>
  );
}
