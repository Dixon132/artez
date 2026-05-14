import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getAlternateLinks, getCommonMetadata } from "@/lib/seo";
import { localeToBcp47, type Locale } from "@/lib/i18n";
import AboutSection from "@/components/sections/AboutSection";

interface PageProps {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "about" });

    const title = t("metaTitle");
    const description = t("metaDescription");

    const alternateLinks = getAlternateLinks("/about", locale);
    const commonMetadata = getCommonMetadata(locale);
    const currentBcp47 = localeToBcp47[locale as Locale];

    return {
        title,
        description,
        alternates: {
            canonical: alternateLinks.canonical,
            languages: alternateLinks.languages,
        },
        openGraph: {
            title,
            description,
            url: alternateLinks.canonical,
            type: "website",
            locale: currentBcp47,
            ...commonMetadata.openGraph,
        },
    };
}

export default function AboutPage() {
    return (
        <main>
            <AboutSection />
        </main>
    );
}
