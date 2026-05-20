"use client";

import { Link, usePathname } from "@/lib/navigation";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { locales } from "@/lib/i18n";

export default function Navbar({ locale }: { locale: string }) {
    const pathname = usePathname();
    const params = useParams();
    const t = useTranslations("navbar");
    const currentLocale = useLocale();

    const [scrolled, setScrolled] = useState(false);
    const isHome = pathname === "/";

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Build the locale-aware href for locale switching
    const getLocaleSwitchHref = (): any => {
        if (pathname === "/products/[id]" && params.id) {
            return { pathname: "/products/[id]" as const, params: { id: String(params.id) } };
        }
        return pathname;
    };

    const navClass = isHome
        ? (scrolled
            ? "bg-gradient-to-b from-black/60 to-transparent backdrop-blur-[2px]"
            : "bg-gradient-to-b from-black/30 to-transparent")
        : "bg-white/70 backdrop-blur-[4px] shadow-sm";

    const textClass = isHome ? "text-white" : "text-stone-900";
    const textHoverClass = isHome ? "text-white/80 hover:text-amber-400" : "text-stone-700 hover:text-amber-600";

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-5 transition-all duration-300 ${navClass}`}
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
            {/* Logo */}
            <Link
                href="/"
                className={`${textClass} text-2xl font-semibold tracking-widest uppercase transition-colors`}
                style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.2em" }}
            >
                Artesena
            </Link>

            {/* Navigation links */}
            <div className="flex items-center gap-10">
                <Link href="/" className={`${textHoverClass} transition-colors text-sm uppercase tracking-widest`}>
                    {t("home")}
                </Link>
                <Link href="/products" className={`${textHoverClass} transition-colors text-sm uppercase tracking-widest`}>
                    {t("products")}
                </Link>
                <Link href="/cart" className={`${textHoverClass} transition-colors text-sm uppercase tracking-widest flex items-center gap-2`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {t("cart")}
                </Link>
            </div>

            {/* Language selector - dynamically renders all locales from config */}
            <div className="flex items-center gap-4" aria-label={t("language")}>
                {locales.map((loc, i) => (
                    <span key={loc} className="flex items-center gap-4">
                        <Link
                            href={getLocaleSwitchHref()}
                            locale={loc}
                            className={`text-xs uppercase tracking-widest transition-colors ${
                                loc === currentLocale 
                                    ? "text-amber-500 font-semibold" 
                                    : isHome
                                        ? "text-white/40 hover:text-white/80"
                                        : "text-stone-400 hover:text-stone-700"
                            }`}
                            aria-label={`${t("language")}: ${loc.toUpperCase()}`}
                            aria-current={loc === currentLocale ? "true" : undefined}
                        >
                            {loc}
                        </Link>
                        {i < locales.length - 1 && <span className={`text-xs ${isHome ? "text-white/20" : "text-stone-300"}`}>·</span>}
                    </span>
                ))}
            </div>
        </nav>
    );
}
