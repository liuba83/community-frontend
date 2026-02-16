export function Tag({ children, active, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold transition-colors cursor-pointer ${
        active
          ? 'bg-dark-blue text-white'
          : 'bg-light-gray text-text hover:bg-gray'
      } ${className}`}
    >
      {children}
    </button>
  );
}
