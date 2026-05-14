export const locales = ["en", "es", "fr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

// BCP 47 mapping for OG tags
export const localeToBcp47: Record<Locale, string> = {
    en: "en_US",
    es: "es_ES",
    fr: "fr_FR",
};

// Load messages for a given locale with fallback to default locale
export async function getMessages(locale: string) {
    try {
        return (await import(`@/messages/${locale}.json`)).default;
    } catch {
        console.warn(
            `Translation file for "${locale}" not found, falling back to "${defaultLocale}"`
        );
        return (await import(`@/messages/${defaultLocale}.json`)).default;
    }
}
