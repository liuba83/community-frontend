import { useLanguage } from '../../hooks/useLanguage';

export function LanguageSelector() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-[10px] bg-gray h-[52px] px-[15px] rounded-[25px] hover:bg-[#e0e0e0] transition-colors cursor-pointer"
      aria-label={`Switch to ${language === 'en' ? 'Ukrainian' : 'English'}`}
    >
      <span className="text-lg">{language === 'en' ? '\uD83C\uDDFA\uD83C\uDDF8' : '\uD83C\uDDFA\uD83C\uDDE6'}</span>
      <span className="text-lg font-semibold text-dark-blue">{language === 'en' ? 'US' : 'UA'}</span>
    </button>
  );
}
