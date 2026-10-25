export default function Card({ children, className = '', hover = false, padding = 'p-6', ...props }) {
  return (
    <div
      className={`app-card bg-white/95 backdrop-blur-sm rounded-3xl border border-bloom-border/70 shadow-soft transition-all duration-200 ${
        hover ? 'hover:shadow-soft-md hover:border-sage-200' : ''
      } ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
