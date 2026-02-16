import { useState } from 'react';
import { Logo } from './Logo';
import { CategoryMenu } from './CategoryMenu';
import { LanguageSelector } from './LanguageSelector';
import { MobileMenu } from './MobileMenu';
import { Button } from '../UI/Button';
import { MenuIcon } from '../UI/Icon';
import { useLanguage } from '../../hooks/useLanguage';

export function Header({ onSelectCategory }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();
  const googleFormUrl = import.meta.env.VITE_GOOGLE_FORM_URL || '#';

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-stroke">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Logo />
            <CategoryMenu onSelectCategory={onSelectCategory} />
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <LanguageSelector />
            </div>
            <div className="hidden md:block">
              <Button href={googleFormUrl} className="text-sm">
                {t('header.addService')}
              </Button>
            </div>
            <button
              className="md:hidden p-2 cursor-pointer"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <MenuIcon className="w-6 h-6 text-dark-blue" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onSelectCategory={(cat) => {
          onSelectCategory(cat);
          setMobileMenuOpen(false);
        }}
      />
    </>
  );
}
