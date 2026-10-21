import React from 'react';

export default function Badge({ children, variant = 'sage', size = 'sm', className = '' }) {
  const variants = {
    sage: 'bg-sage-100 text-sage-800 border-sage-200',
    mint: 'bg-mint-100 text-sage-800 border-mint-200',
    butter: 'bg-butter-100 text-amber-900 border-butter-200',
    peach: 'bg-peach-100 text-rose-900 border-peach-200',
    cream: 'bg-cream-200 text-bloom-dark border-cream-300',
    forest: 'bg-sage-700 text-white border-transparent',
  };

  const sizes = {
    xs: 'px-2 py-0.5 text-[11px]',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full border ${variants[variant] || variants.sage} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
}
