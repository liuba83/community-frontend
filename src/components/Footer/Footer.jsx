import { useLanguage } from "../../hooks/useLanguage";

export function Footer() {
    const { t } = useLanguage();
    const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || "info@spilno.us";

    return (
        <footer className="border-t border-stroke py-8 px-4 text-center text-sm text-text/50">
            <p className="mb-2">
                &copy; {new Date().getFullYear()} {t("footer.copyright")}
            </p>
            <div className="flex justify-center gap-4">
                <a
                    href={`mailto:${contactEmail}`}
                    className="text-brand-blue hover:underline"
                >
                    {t("footer.contact")}
                </a>
                <span aria-hidden="true">·</span>
                <a href="/privacy" className="text-brand-blue hover:underline">
                    {t("footer.privacy")}
                </a>
            </div>
        </footer>
    );
}
