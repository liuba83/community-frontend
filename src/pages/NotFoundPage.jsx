import { Link } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import { Header } from "../components/Header/Header";
import { Footer } from "../components/Footer/Footer";

const content = {
    en: {
        title: "Page not found",
        message: "The page you're looking for doesn't exist or has been moved.",
        back: "Back to home",
    },
    ua: {
        title: "Сторінку не знайдено",
        message: "Сторінка, яку ви шукаєте, не існує або була переміщена.",
        back: "На головну",
    },
};

export function NotFoundPage() {
    const { language } = useLanguage();
    const c = content[language] || content.en;

    return (
        <div className="min-h-screen bg-white dark:bg-[#0A1628] flex flex-col">
            <Header />
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
                <p className="text-8xl font-bold text-brand-red mb-6 leading-none">
                    404
                </p>
                <h1 className="text-2xl font-bold text-dark-blue dark:text-white mb-3">
                    {c.title}
                </h1>
                <p className="text-sm text-text/60 dark:text-white/50 mb-8 max-w-xs">
                    {c.message}
                </p>
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 bg-brand-red text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-brand-red/90 transition-colors"
                >
                    {c.back}
                </Link>
            </main>
            <Footer />
        </div>
    );
}
