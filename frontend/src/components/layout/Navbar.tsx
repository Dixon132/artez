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
    const [menuOpen, setMenuOpen] = useState(false);
    const isHome = pathname === "/";

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const getLocaleSwitchHref = (): any => {
        if (pathname === "/products/[id]" && params.id) {
            return { pathname: "/products/[id]" as const, params: { id: String(params.id) } };
        }
        return pathname;
    };

    const isTransparent = isHome && !scrolled && !menuOpen;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=DM+Sans:wght@300;400;500&display=swap');
                .nav-root {
                    position: fixed;
                    top: 0; left: 0; right: 0;
                    z-index: 100;
                    transition: background 0.4s ease, border-color 0.4s ease;
                }
                .nav-root.solid {
                    background: #fff;
                    border-bottom: 1px solid #e8e4df;
                }
                .nav-root.transparent {
                    background: transparent;
                    border-bottom: 1px solid transparent;
                }
                .nav-inner {
                    display: grid;
                    grid-template-columns: 1fr auto 1fr;
                    align-items: center;
                    padding: 0 40px;
                    height: 64px;
                }
                .nav-left { display: flex; align-items: center; gap: 32px; }
                .nav-center {}
                .nav-right { display: flex; align-items: center; justify-content: flex-end; gap: 20px; }

                .nav-logo {
                    font-family: 'Cormorant Garamond', serif;
                    font-weight: 500;
                    font-size: 22px;
                    letter-spacing: 0.25em;
                    text-transform: uppercase;
                    text-decoration: none;
                    transition: color 0.2s;
                }
                .nav-link {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 11px;
                    font-weight: 400;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                    text-decoration: none;
                    transition: opacity 0.2s;
                    white-space: nowrap;
                }
                .nav-link:hover { opacity: 0.55; }
                .nav-icon-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 4px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 11px;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    text-decoration: none;
                    transition: opacity 0.2s;
                }
                .nav-icon-btn:hover { opacity: 0.55; }
                .locale-dot { font-size: 10px; opacity: 0.3; }
                .locale-btn {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 11px;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    text-decoration: none;
                    transition: opacity 0.2s;
                }
                .locale-btn.active { font-weight: 500; }
                .locale-btn:not(.active) { opacity: 0.4; }
                .locale-btn:hover { opacity: 1; }

                /* Mobile */
                @media (max-width: 768px) {
                    .nav-inner { grid-template-columns: auto 1fr auto; padding: 0 20px; }
                    .nav-left-links { display: none; }
                    .nav-right-locale { display: none; }
                }
            `}</style>

            <nav className={`nav-root ${isTransparent ? "transparent" : "solid"}`} aria-label="Main navigation">
                <div className="nav-inner">
                    {/* LEFT */}
                    <div className="nav-left">
                        <button
                            className="nav-icon-btn"
                            style={{ color: isTransparent ? "#fff" : "#1c1917" }}
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label="Menu"
                        >
                            <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
                                <line x1="0" y1="1" x2="18" y2="1" stroke="currentColor" strokeWidth="1.2"/>
                                <line x1="0" y1="6" x2="18" y2="6" stroke="currentColor" strokeWidth="1.2"/>
                                <line x1="0" y1="11" x2="18" y2="11" stroke="currentColor" strokeWidth="1.2"/>
                            </svg>
                        </button>
                        <div className="nav-left-links" style={{ display: "flex", gap: "28px" }}>
                            <Link
                                href="/products"
                                className="nav-link"
                                style={{ color: isTransparent ? "#fff" : "#1c1917" }}
                            >
                                {t("products")}
                            </Link>
                            <Link
                                href="/about"
                                className="nav-link"
                                style={{ color: isTransparent ? "#fff" : "#1c1917" }}
                            >
                                {t("about") || "Nosotros"}
                            </Link>
                            <Link
                                href="/contact"
                                className="nav-link"
                                style={{ color: isTransparent ? "#fff" : "#1c1917" }}
                            >
                                {t("contact") || "Contacto"}
                            </Link>
                        </div>
                    </div>

                    {/* CENTER - Logo */}
                    <div className="nav-center" style={{ display: "flex", justifyContent: "center" }}>
                        <Link
                            href="/"
                            className="nav-logo"
                            style={{ color: isTransparent ? "#fff" : "#1c1917" }}
                        >
                            Artesena
                        </Link>
                    </div>

                    {/* RIGHT */}
                    <div className="nav-right">
                        <div className="nav-right-locale" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            {locales.map((loc, i) => (
                                <span key={loc} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <Link
                                        href={getLocaleSwitchHref()}
                                        locale={loc}
                                        className={`locale-btn ${loc === currentLocale ? "active" : ""}`}
                                        style={{ color: isTransparent ? "#fff" : "#1c1917" }}
                                        aria-label={`${t("language")}: ${loc.toUpperCase()}`}
                                        aria-current={loc === currentLocale ? "true" : undefined}
                                    >
                                        {loc.toUpperCase()}
                                    </Link>
                                    {i < locales.length - 1 && (
                                        <span className="locale-dot" style={{ color: isTransparent ? "#fff" : "#1c1917" }}>|</span>
                                    )}
                                </span>
                            ))}
                        </div>
                        <Link
                            href="/cart"
                            className="nav-icon-btn"
                            style={{ color: isTransparent ? "#fff" : "#1c1917" }}
                            aria-label={t("cart")}
                        >
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/>
                            </svg>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Full-screen menu overlay */}
            {menuOpen && (
                <div
                    style={{
                        position: "fixed", inset: 0, zIndex: 99,
                        background: "#fff",
                        display: "flex", flexDirection: "column",
                        paddingTop: "64px",
                    }}
                >
                    <div style={{ padding: "40px 40px 20px", borderBottom: "1px solid #f0ece7" }}>
                        <button
                            onClick={() => setMenuOpen(false)}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex" }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1c1917" strokeWidth="1.2">
                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                    <nav style={{ padding: "48px 40px", display: "flex", flexDirection: "column", gap: "8px" }}>
                        {[
                            { href: "/", label: t("home") || "Inicio" },
                            { href: "/products", label: t("products") || "Productos" },
                            { href: "/about", label: t("about") || "Nosotros" },
                            { href: "/contact", label: t("contact") || "Contacto" },
                            { href: "/cart", label: t("cart") || "Carrito" },
                        ].map(({ href, label }) => (
                            <Link
                                key={href}
                                href={href as any}
                                onClick={() => setMenuOpen(false)}
                                style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontSize: "clamp(32px, 6vw, 56px)",
                                    fontWeight: 300,
                                    letterSpacing: "-0.01em",
                                    color: "#1c1917",
                                    textDecoration: "none",
                                    lineHeight: 1.15,
                                    transition: "opacity 0.2s",
                                }}
                                className="nav-link-menu"
                            >
                                {label}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </>
    );
}
