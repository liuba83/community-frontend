import { useLanguage } from '../hooks/useLanguage';
import { Header } from '../components/Header/Header';
import { Footer } from '../components/Footer/Footer';

const content = {
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated: February 2026',
    sections: [
      {
        heading: 'What we collect',
        text: 'We display information voluntarily submitted by service providers: name, business name, service description, contact details, and location. This information is submitted via a public Google Form and is intended to be publicly visible.',
      },
      {
        heading: 'How we use it',
        text: 'The submitted information is used solely to display service listings in our directory. We do not sell or share your data with third parties for marketing purposes.',
      },
      {
        heading: 'Cookies',
        text: 'We store your language preference (English or Ukrainian) in your browser\'s local storage. No tracking or analytics cookies are used.',
      },
      {
        heading: 'Your rights',
        text: 'If you would like your listing removed or updated, please contact us and we will process your request promptly.',
      },
      {
        heading: 'Contact',
        text: 'Questions about this policy? Reach us at',
      },
    ],
  },
  ua: {
    title: 'Політика конфіденційності',
    updated: 'Оновлено: лютий 2026',
    sections: [
      {
        heading: 'Що ми збираємо',
        text: 'Ми відображаємо інформацію, добровільно надану постачальниками послуг: ім\'я, назву бізнесу, опис послуг, контактні дані та місцезнаходження. Ця інформація подається через публічну Google-форму та призначена для відкритого перегляду.',
      },
      {
        heading: 'Як ми її використовуємо',
        text: 'Надана інформація використовується виключно для відображення оголошень у нашому каталозі. Ми не продаємо та не передаємо ваші дані третім особам у маркетингових цілях.',
      },
      {
        heading: 'Файли cookie',
        text: 'Ми зберігаємо вашу мовну перевагу (англійська або українська) у локальному сховищі браузера. Файли cookie для відстеження або аналітики не використовуються.',
      },
      {
        heading: 'Ваші права',
        text: 'Якщо ви бажаєте видалити або оновити своє оголошення, будь ласка, зв\'яжіться з нами, і ми оперативно опрацюємо ваш запит.',
      },
      {
        heading: 'Контакт',
        text: 'Питання щодо цієї політики? Напишіть нам на',
      },
    ],
  },
};

export function PrivacyPage() {
  const { language } = useLanguage();
  const c = content[language] || content.en;
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || 'admin@example.com';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-12">
        <h1 className="text-3xl font-bold text-dark-blue mb-1">{c.title}</h1>
        <p className="text-sm text-text/50 mb-10">{c.updated}</p>
        <div className="space-y-8">
          {c.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-base font-bold text-dark-blue mb-2">{section.heading}</h2>
              <p className="text-sm text-text/70 leading-relaxed">
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
