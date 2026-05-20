import { redirect } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { locales, defaultLocale, getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import Navbar from "@/components/layout/Navbar";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
import { GA_ID } from "@/lib/analytics";
import { FB_PIXEL_ID } from "@/lib/fbpixel";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale against supported locales, redirect to default if invalid
  if (!locales.includes(locale as Locale)) {
    redirect(`/${defaultLocale}`);
  }

  // Load translation messages for the current locale
  const messages = await getMessages(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Navbar locale={locale} />
      {children}

      {/* Google Analytics - only render when GA_ID is configured */}
      {GA_ID && <GoogleAnalytics gaId={GA_ID} />}

      {/* Meta Pixel - only render when FB_PIXEL_ID is configured */}
      {FB_PIXEL_ID && (
        <>
          <Script
            id="fb-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${FB_PIXEL_ID}');
                fbq('track', 'PageView');
              `,
            }}
          />
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}
    </NextIntlClientProvider>
  );
}
