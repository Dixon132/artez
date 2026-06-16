import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getAlternateLinks, getCommonMetadata, getDefaultOgImage } from "@/lib/seo";
import { localeToBcp47, type Locale } from "@/lib/i18n";

interface Props {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "contact" });

    const title = t("metaTitle");
    const description = t("metaDescription");

    const alternateLinks = getAlternateLinks("/contact", locale);
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
            url: alternateLinks.canonical,
            type: "website",
            locale: currentBcp47,
            alternateLocale: commonMetadata.openGraph?.alternateLocale,
            siteName: "Artesena",
            images: [
                {
                    url: ogImage.url,
                    width: ogImage.width,
                    height: ogImage.height,
                    alt: ogImage.alt,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [ogImage.url],
        },
    };
}

import ContactClient from "./ContactClient";

export default async function ContactPage({ params }: Props) {
    const { locale } = await params;
    return <ContactClient />;
}
