import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "artesena.com",
        pathname: "/media/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: http://127.0.0.1:8000",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://www.google-analytics.com https://www.facebook.com http://127.0.0.1:8000 https://artesena.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      // Spanish localized routes
      { source: "/es/productos", destination: "/es/products" },
      { source: "/es/productos/:id", destination: "/es/products/:id" },
      { source: "/es/carrito", destination: "/es/cart" },
      { source: "/es/nosotros", destination: "/es/about" },
      { source: "/es/pagar", destination: "/es/checkout" },
      { source: "/es/pagar/success", destination: "/es/checkout/success" },
      { source: "/es/contacto", destination: "/es/contact" },
      // French localized routes
      { source: "/fr/produits", destination: "/fr/products" },
      { source: "/fr/produits/:id", destination: "/fr/products/:id" },
      { source: "/fr/panier", destination: "/fr/cart" },
      { source: "/fr/a-propos", destination: "/fr/about" },
      { source: "/fr/paiement", destination: "/fr/checkout" },
      { source: "/fr/paiement/success", destination: "/fr/checkout/success" },
    ];
  },
};

export default withNextIntl(nextConfig);
