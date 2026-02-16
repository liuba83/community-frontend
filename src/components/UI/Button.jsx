export function Button({ children, variant = 'primary', href, className = '', ...props }) {
  const base = 'inline-flex items-center justify-center font-bold rounded-lg transition-colors cursor-pointer';
  const variants = {
    primary: 'bg-brand-red text-white px-6 py-3 hover:bg-red-700',
    outline: 'border border-stroke text-dark-blue px-4 py-2 hover:bg-light-gray',
  };

  const classes = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
