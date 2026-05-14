import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getAlternateLinks, getCommonMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/i18n";

interface Props {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "contact" });
    const alternateLinks = getAlternateLinks("/contact", locale);
    const commonMetadata = getCommonMetadata(locale);

    return {
        title: t("metaTitle"),
        description: t("metaDescription"),
        alternates: {
            canonical: alternateLinks.canonical,
            languages: alternateLinks.languages,
        },
        openGraph: {
            title: t("metaTitle"),
            description: t("metaDescription"),
            url: alternateLinks.canonical,
            type: "website",
            ...commonMetadata.openGraph,
        },
    };
}

export default async function ContactPage({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations({ locale: locale as Locale, namespace: "contact" });

    return (
        <main className="min-h-screen bg-stone-50 py-24 px-6">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl font-bold text-stone-900 mb-6">
                    {t("title")}
                </h1>
                <p className="text-lg text-stone-600 mb-12">
                    {t("description")}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-stone-800 mb-2">
                            {t("email")}
                        </h2>
                        <p className="text-stone-600">info@artesena.com</p>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-stone-800 mb-2">
                            {t("phone")}
                        </h2>
                        <p className="text-stone-600">+591 2 1234567</p>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-stone-800 mb-2">
                            {t("address")}
                        </h2>
                        <p className="text-stone-600">La Paz, Bolivia</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
