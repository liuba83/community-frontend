import { CloseIcon } from '../UI/Icon';
import { Button } from '../UI/Button';
import { LanguageSelector } from './LanguageSelector';
import { ThemeToggle } from './ThemeToggle';
import { MobileCategoryMenu } from './CategoryMenu';
import { useLanguage } from '../../hooks/useLanguage';

export function MobileMenu({ isOpen, onClose, onSelectCategory }) {
  const { t } = useLanguage();
  const googleFormUrl = import.meta.env.VITE_GOOGLE_FORM_URL || '#';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-[#0A1628] overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <ThemeToggle />
          </div>
          <button onClick={onClose} className="p-2 cursor-pointer" aria-label="Close menu">
            <CloseIcon className="w-6 h-6 text-dark-blue" />
          </button>
        </div>

        <div className="mb-6">
          <Button href={googleFormUrl} className="w-full text-center">
            {t('header.addService')}
          </Button>
        </div>

        <MobileCategoryMenu onSelectCategory={onSelectCategory} onClose={onClose} />
      </div>
    </div>
  );
}
