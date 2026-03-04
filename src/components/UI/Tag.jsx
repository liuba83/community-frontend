export function Tag({ children, icon, active, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-base transition-colors cursor-pointer border ${
        active
          ? 'bg-dark-blue dark:bg-brand-red text-white border-dark-blue dark:border-brand-red'
          : 'bg-white dark:bg-[#0F2040] text-text border-stroke hover:bg-light-gray'
      } ${className}`}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}
