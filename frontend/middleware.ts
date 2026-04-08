import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "es", "fr"];

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    const hasLocale = locales.some((locale) =>
        pathname.startsWith(`/${locale}`)
    );

    if (!hasLocale) {
        return NextResponse.redirect(
            new URL(`/en${pathname}`, request.url)
        );
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next|favicon.ico|admin).*)"],
};