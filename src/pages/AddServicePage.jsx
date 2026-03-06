import { useLanguage } from '../hooks/useLanguage';
import { Header } from '../components/Header/Header';
import { Footer } from '../components/Footer/Footer';
import { AddServiceForm } from '../components/AddServiceForm/AddServiceForm';

export function AddServicePage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-light-gray flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-12">
        <h1 className="text-3xl font-bold text-dark-blue mb-2">{t('addService.pageTitle')}</h1>
        <p className="text-sm text-text/60 mb-8">{t('addService.subtitle')}</p>
        <div className="bg-white dark:bg-[#0F2040] rounded-[30px] shadow-card p-6 md:p-8">
          <AddServiceForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
