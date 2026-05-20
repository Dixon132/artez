import type { Metadata } from "next";
import { Geist, Geist_Mono, Aldrich, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/components/layout/LenisProvider";
import { headers } from "next/headers";
import { defaultLocale } from "@/lib/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const AldrichSans = Aldrich({
  variable: "--font-aldrich",
  subsets: ["latin"],
  weight: "400"
})
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://artesena.com"
  ),
  title: {
    default: "Artesena | Handcrafted Bolivian Instruments",
    template: "%s | Artesena",
  },
  description:
    "Discover authentic handcrafted Bolivian string instruments — charangos, ronrocos, and walaychos — made by master artisans using traditional techniques passed down through generations.",
  openGraph: {
    siteName: "Artesena",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const locale = headersList.get("x-next-intl-locale") || defaultLocale;

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${AldrichSans.variable} ${cormorant.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://connect.facebook.net" />
        {process.env.NEXT_PUBLIC_API_URL && (
          <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL} />
        )}
      </head>
      <body className="min-h-full flex flex-col">
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
