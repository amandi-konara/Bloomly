export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  icon: IconComponent,
  ...props
}) {
  const base = 'app-button inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5',
    icon: 'p-2.5 rounded-xl',
  };

  const variants = {
    primary:
      'bg-sage-300 hover:bg-sage-400 text-sage-900 shadow-clay active:shadow-clay-active active:translate-y-0.5',
    forest:
      'bg-sage-700 hover:bg-sage-800 text-white shadow-soft active:translate-y-0.5',
    secondary:
      'bg-cream-200/80 hover:bg-cream-200 text-bloom-dark border border-bloom-border active:translate-y-0.5',
    outline:
      'bg-transparent hover:bg-cream-200/50 text-bloom-dark border border-bloom-border active:translate-y-0.5',
    ghost:
      'bg-transparent hover:bg-sage-100/60 text-bloom-muted hover:text-bloom-dark',
    peach:
      'bg-peach-300 hover:bg-peach-400 text-bloom-dark shadow-clay-active active:translate-y-0.5',
    butter:
      'bg-butter-300 hover:bg-butter-400 text-bloom-dark shadow-clay-active active:translate-y-0.5',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} app-button-${size} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {IconComponent && <IconComponent className="app-button-icon" aria-hidden="true" />}
      {children}
    </button>
  );
}
