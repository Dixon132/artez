import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import CheckoutClient from "./CheckoutClient";

type Props = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "checkout" });

    return {
        title: t("title"),
        robots: {
            index: false,
            follow: true,
        },
    };
}

export default function CheckoutPage() {
    return <CheckoutClient />;
}
