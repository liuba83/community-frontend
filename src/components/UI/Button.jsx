export function Button({ children, variant = 'primary', href, className = '', ...props }) {
  const base = 'inline-flex items-center justify-center font-bold rounded-[25px] transition-colors cursor-pointer text-lg';
  const variants = {
    primary: 'bg-brand-red text-white px-[25px] py-[15px] hover:bg-red-700',
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
