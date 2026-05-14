import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getAlternateLinks, getCommonMetadata, getBaseUrl } from "@/lib/seo";
import { localeToBcp47, type Locale } from "@/lib/i18n";
import HomeClient from "./HomeClient";

interface PageProps {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "home" });

    const title = `Artesena | ${t("title")}`;
    const description = t("metaDescription");

    const alternateLinks = getAlternateLinks("/", locale);
    const commonMetadata = getCommonMetadata(locale);
    const baseUrl = getBaseUrl();
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
            images: [{ url: `${baseUrl}/img/charango.png` }],
            url: alternateLinks.canonical,
            type: "website",
            locale: currentBcp47,
            alternateLocale: commonMetadata.openGraph?.alternateLocale,
        },
    };
}

export default function HomePage() {
    return <HomeClient />;
}
