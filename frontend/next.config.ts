import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
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
  async rewrites() {
    return [
      // Spanish localized routes
      { source: "/es/productos", destination: "/es/products" },
      { source: "/es/productos/:id", destination: "/es/products/:id" },
      { source: "/es/carrito", destination: "/es/cart" },
      { source: "/es/nosotros", destination: "/es/about" },
      { source: "/es/pagar", destination: "/es/checkout" },
      { source: "/es/contacto", destination: "/es/contact" },
      // French localized routes
      { source: "/fr/produits", destination: "/fr/products" },
      { source: "/fr/produits/:id", destination: "/fr/products/:id" },
      { source: "/fr/panier", destination: "/fr/cart" },
      { source: "/fr/a-propos", destination: "/fr/about" },
      { source: "/fr/paiement", destination: "/fr/checkout" },
    ];
  },
};

export default withNextIntl(nextConfig);
