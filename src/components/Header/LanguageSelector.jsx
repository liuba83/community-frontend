import { useLanguage } from '../../hooks/useLanguage';

export function LanguageSelector() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-light-gray transition-colors cursor-pointer"
      aria-label={`Switch to ${language === 'en' ? 'Ukrainian' : 'English'}`}
    >
      <span className="text-lg">{language === 'en' ? '\uD83C\uDDFA\uD83C\uDDF8' : '\uD83C\uDDFA\uD83C\uDDE6'}</span>
      <span className="text-sm font-bold text-dark-blue uppercase">{language === 'en' ? 'EN' : 'UA'}</span>
    </button>
  );
}
