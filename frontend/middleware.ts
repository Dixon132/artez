import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
    // Adding a comment to force Next.js to recompile this middleware
    matcher: ["/((?!_next|favicon.ico|sitemap.xml|robots.txt|admin|media|static|.*\\..*).*)"],
};
