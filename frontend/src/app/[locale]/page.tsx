import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
    getAlternateLinks,
    getCommonMetadata,
    getDefaultOgImage,
} from "@/lib/seo";
import { localeToBcp47, type Locale } from "@/lib/i18n";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";
import WebSiteJsonLd from "@/components/seo/WebSiteJsonLd";
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
    const currentBcp47 = localeToBcp47[locale as Locale];
    const ogImage = getDefaultOgImage();

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
            images: [
                {
                    url: ogImage.url,
                    width: ogImage.width,
                    height: ogImage.height,
                    alt: ogImage.alt,
                },
            ],
            url: alternateLinks.canonical,
            type: "website",
            locale: currentBcp47,
            alternateLocale: commonMetadata.openGraph?.alternateLocale,
            siteName: "Artesena",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [ogImage.url],
        },
    };
}

export default async function HomePage({ params }: PageProps) {
    const { locale } = await params;

    return (
        <>
            <OrganizationJsonLd />
            <WebSiteJsonLd locale={locale} />
            <HomeClient />
        </>
    );
}
