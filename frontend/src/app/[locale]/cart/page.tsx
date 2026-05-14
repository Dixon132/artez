import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getAlternateLinks, getCommonMetadata } from "@/lib/seo";
import { localeToBcp47, type Locale } from "@/lib/i18n";
import CartClient from "./CartClient";

type Props = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "cart" });

    // Since cart content is session-based (client-side), use a generic translated title
    const title = t("title");

    // Get alternate links for the localized cart path
    const alternateLinks = getAlternateLinks("/cart", locale);
    const commonMetadata = getCommonMetadata(locale);
    const bcp47 = localeToBcp47[locale as Locale];

    return {
        title,
        robots: {
            index: false,
            follow: false,
        },
        alternates: {
            canonical: alternateLinks.canonical,
            languages: alternateLinks.languages,
        },
        openGraph: {
            title,
            url: alternateLinks.canonical,
            type: "website",
            locale: bcp47,
            ...commonMetadata.openGraph,
        },
    };
}

export default function CartPage() {
    return <CartClient />;
}
