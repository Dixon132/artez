"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const locales = ["en", "es", "fr"];

export default function Navbar({ locale }: { locale: string }) {
    const pathname = usePathname();
    const pathWithoutLocale = pathname.replace(`/${locale}`, "");

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-5"
            style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.45), transparent)" }}
        >
            {/* Logo */}
            <Link
                href={`/${locale}`}
                className="text-white text-2xl font-semibold tracking-widest uppercase"
                style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.2em" }}
            >
                Artesena
            </Link>

            {/* Links centro */}
            <div className="flex items-center gap-10">
                <Link href={`/${locale}`} className="text-white/80 hover:text-amber-400 transition-colors text-sm uppercase tracking-widest">
                    Inicio
                </Link>
                <Link href={`/${locale}/products`} className="text-white/80 hover:text-amber-400 transition-colors text-sm uppercase tracking-widest">
                    Productos
                </Link>
                <Link href={`/${locale}/contact`} className="text-white/80 hover:text-amber-400 transition-colors text-sm uppercase tracking-widest">
                    Contacto
                </Link>
            </div>

            {/* Idiomas derecha */}
            <div className="flex items-center gap-4">
                {locales.map((loc, i) => (
                    <span key={loc} className="flex items-center gap-4">
                        <Link
                            href={`/${loc}${pathWithoutLocale}`}
                            className={`text-xs uppercase tracking-widest transition-colors ${loc === locale ? "text-amber-400 font-semibold" : "text-white/40 hover:text-white/80"}`}
                        >
                            {loc}
                        </Link>
                        {i < locales.length - 1 && <span className="text-white/20 text-xs">·</span>}
                    </span>
                ))}
            </div>
        </nav>
    );
}
