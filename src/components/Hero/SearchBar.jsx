import { SearchIcon } from '../UI/Icon';
import { useLanguage } from '../../hooks/useLanguage';

export function SearchBar({ value, onChange }) {
  const { t } = useLanguage();

  return (
    <div className="relative w-full max-w-2xl">
      <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-blue/40" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('hero.searchPlaceholder')}
        className="w-full pl-12 pr-4 py-3 rounded-xl border border-stroke bg-white text-text placeholder:text-dark-blue/40 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
      />
    </div>
  );
}
