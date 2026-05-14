import { defineRouting } from "next-intl/routing";
import { locales, defaultLocale } from "@/lib/i18n";

export const routing = defineRouting({
    locales,
    defaultLocale,
    localePrefix: "always",
    pathnames: {
        "/": "/",
        "/products": {
            en: "/products",
            es: "/productos",
            fr: "/produits",
        },
        "/products/[id]": {
            en: "/products/[id]",
            es: "/productos/[id]",
            fr: "/produits/[id]",
        },
        "/cart": {
            en: "/cart",
            es: "/carrito",
            fr: "/panier",
        },
        "/about": {
            en: "/about",
            es: "/nosotros",
            fr: "/a-propos",
        },
        "/checkout": {
            en: "/checkout",
            es: "/pagar",
            fr: "/paiement",
        },
        "/contact": {
            en: "/contact",
            es: "/contacto",
            fr: "/contact",
        },
    },
});

export type Pathnames = keyof typeof routing.pathnames;
export type AppLocale = (typeof routing.locales)[number];
