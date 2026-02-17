import { useLanguage } from '../../hooks/useLanguage';
import { ChevronDownIcon } from '../UI/Icon';

export function LanguageSelector() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-[2px] bg-gray h-[52px] px-[15px] rounded-[25px] hover:bg-[#e0e0e0] transition-colors cursor-pointer"
      aria-label={`Switch to ${language === 'en' ? 'Ukrainian' : 'English'}`}
    >
      <div className="flex items-end gap-[10px]">
        <span className="text-lg">{language === 'en' ? '\uD83C\uDDFA\uD83C\uDDF8' : '\uD83C\uDDFA\uD83C\uDDE6'}</span>
        <span className="text-lg font-semibold text-dark-blue">{language === 'en' ? 'US' : 'UA'}</span>
      </div>
      <ChevronDownIcon className="w-6 h-6 text-dark-blue" />
    </button>
  );
}
