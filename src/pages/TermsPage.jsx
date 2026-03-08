import { useLanguage } from '../hooks/useLanguage';
import { Header } from '../components/Header/Header';
import { Footer } from '../components/Footer/Footer';

const content = {
  en: {
    title: 'Terms of Service',
    updated: 'Last updated: March 2026',
    sections: [
      {
        heading: 'About this directory',
        text: 'Spilno is a community directory that lists services offered by Ukrainian professionals in Texas. We are not a service provider ourselves and do not endorse, verify, or guarantee the quality of any listed service.',
      },
      {
        heading: 'Submitting a listing',
        text: 'By submitting a listing, you confirm that all information is accurate, that you have the right to share it, and that your business complies with applicable laws. We reserve the right to reject or remove any listing at our discretion.',
      },
      {
        heading: 'Content guidelines',
        text: 'Listings must represent a real, legitimate service. We do not allow spam, duplicate listings, fake reviews, offensive content, or misleading information. Violations will result in removal.',
      },
      {
        heading: 'Keeping your info current',
        text: 'You are responsible for the accuracy of your listing. If your contact details, services, or availability change, please contact us to update or remove your listing.',
      },
      {
        heading: 'No liability',
        text: 'We are not a party to any transaction or agreement between users and service providers. We are not responsible for the quality, safety, or outcome of any service listed in this directory.',
      },
      {
        heading: 'Changes to these terms',
        text: 'We may update these terms at any time. Continued use of the site means you accept the current version.',
      },
      {
        heading: 'Contact',
        text: 'Questions or requests to update or remove a listing? Reach us at',
      },
    ],
  },
  ua: {
    title: 'Умови використання',
    updated: 'Оновлено: березень 2026',
    sections: [
      {
        heading: 'Про цей каталог',
        text: 'Spilno — це каталог спільноти, що містить послуги українських спеціалістів у Техасі. Ми не є постачальником послуг і не підтримуємо, не перевіряємо та не гарантуємо якість жодної розміщеної послуги.',
      },
      {
        heading: 'Подання оголошення',
        text: 'Надсилаючи оголошення, ви підтверджуєте, що вся інформація є точною, що ви маєте право її розповсюджувати, а ваш бізнес відповідає чинному законодавству. Ми залишаємо за собою право відхилити або видалити будь-яке оголошення на власний розсуд.',
      },
      {
        heading: 'Правила контенту',
        text: 'Оголошення мають представляти реальну, законну послугу. Ми не допускаємо спам, дублікати, фальшиві відгуки, образливий контент або недостовірну інформацію. Порушення призведе до видалення.',
      },
      {
        heading: 'Актуальність інформації',
        text: 'Ви несете відповідальність за точність вашого оголошення. Якщо ваші контактні дані, послуги або доступність змінилися — зверніться до нас для оновлення або видалення.',
      },
      {
        heading: 'Обмеження відповідальності',
        text: 'Ми не є стороною жодної угоди між користувачами та постачальниками послуг. Ми не несемо відповідальності за якість, безпеку або результат будь-якої послуги, розміщеної в каталозі.',
      },
      {
        heading: 'Зміни умов',
        text: 'Ми можемо оновлювати ці умови в будь-який час. Продовження використання сайту означає прийняття актуальної версії.',
      },
      {
        heading: 'Контакт',
        text: 'Питання або запити на оновлення чи видалення оголошення? Напишіть нам на',
      },
    ],
  },
};

export function TermsPage() {
  const { language } = useLanguage();
  const c = content[language] || content.en;
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || 'info@spilno.us';

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A1628] flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-12">
        <h1 className="text-3xl font-bold text-dark-blue dark:text-white mb-1">{c.title}</h1>
        <p className="text-sm text-text/50 dark:text-white/40 mb-10">{c.updated}</p>
        <div className="space-y-8">
          {c.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-base font-bold text-dark-blue dark:text-white/90 mb-2">{section.heading}</h2>
              <p className="text-sm text-text/70 dark:text-white/60 leading-relaxed">
                {section.text}
                {section.heading === 'Contact' || section.heading === 'Контакт' ? (
                  <>
                    {' '}
                    <a href={`mailto:${contactEmail}`} className="text-brand-blue hover:underline">
                      {contactEmail}
                    </a>
                  </>
                ) : null}
              </p>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
