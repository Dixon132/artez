"use client";

import { useTranslations } from "next-intl";

/**
 * Shared About section component.
 * Used as a full page at /about and can be embedded as a section on the home page.
 * Content is fully rendered in SSR (no JS-dependent scrolling needed).
 */
export default function AboutSection() {
    const t = useTranslations("about");

    return (
        <section id="about" className="min-h-screen bg-stone-50 py-24 px-6">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl font-bold text-stone-900 mb-6">
                    {t("title")}
                </h1>
                <p className="text-lg text-stone-600">
                    {t("description")}
                </p>
            </div>
        </section>
    );
}
