import { CloseIcon } from '../UI/Icon';
import { Button } from '../UI/Button';
import { LanguageSelector } from './LanguageSelector';
import { MobileCategoryMenu } from './CategoryMenu';
import { useLanguage } from '../../hooks/useLanguage';

export function MobileMenu({ isOpen, onClose, onSelectCategory }) {
  const { t } = useLanguage();
  const googleFormUrl = import.meta.env.VITE_GOOGLE_FORM_URL || '#';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <LanguageSelector />
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
