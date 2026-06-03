# Implementation Plan: SEO Full Optimization

## Overview

Comprehensive SEO optimization for the Artesena e-commerce platform (Next.js 16 + Django 6). Implementation covers root layout metadata, page-level metadata with OG/Twitter cards, JSON-LD structured data, enhanced sitemap/robots, analytics guards, breadcrumb navigation, security headers, preconnect links, and performance optimizations. All code is TypeScript targeting the existing `frontend/src/` structure.

## Tasks

- [x] 1. Root layout metadata and SEO utilities
  - [x] 1.1 Update root layout default metadata and metadataBase
    - Modify `src/app/layout.tsx` to set `metadataBase` to `new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://artesena.com")`
    - Set default `title` to `{ default: "Artesena | Handcrafted Bolivian Instruments", template: "%s | Artesena" }`
    - Set default `description` to a concise brand summary
    - Set `openGraph.siteName` to "Artesena"
    - Add preconnect `<link>` elements in the `<head>` for fonts.googleapis.com, fonts.gstatic.com, googletagmanager.com, google-analytics.com, connect.facebook.net, and the API URL
    - _Requirements: 1.1, 1.2, 1.3, 11.5_

  - [x] 1.2 Enhance SEO utility library with OG image helpers
    - Add `OgImageConfig` interface to `src/lib/seo.ts`
    - Implement `getDefaultOgImage()` returning the default brand image config (1200x630, alt text)
    - Implement `getProductOgImage(images, productName)` that uses first product image or falls back to default
    - Implement `truncate(text, maxLength)` utility for description length enforcement
    - Ensure `getBaseUrl()` and `getAlternateLinks()` are correctly exported
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [x]* 1.3 Write property tests for SEO utilities (Properties 1, 7)
    - **Property 1: Canonical URL and hreflang correctness** — test `getAlternateLinks` produces correct canonical, hreflang for all locales, and x-default
    - **Property 7: Product OG image selection** — test `getProductOgImage` uses first image when available, falls back to default when empty
    - **Validates: Requirements 3.1, 3.2, 3.3, 9.2, 9.3**

- [x] 2. Page-level metadata generation
  - [x] 2.1 Implement Home page metadata with OG, Twitter, and locale alternates
    - Update `src/app/[locale]/page.tsx` `generateMetadata` to produce unique title, description (50-160 chars), full OG tags (title, description, image, url, type="website", locale, site_name), Twitter Card (summary_large_image), canonical URL, and hreflang alternates
    - Include `og:locale` in BCP 47 format and `og:locale:alternate` for other locales
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6, 3.1, 3.2, 3.3, 13.1, 13.3, 13.4, 13.5_

  - [x] 2.2 Implement Products List page metadata
    - Update `src/app/[locale]/products/page.tsx` `generateMetadata` with unique title, description, OG (type="website"), Twitter Card, canonical, and hreflang
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6, 3.1, 3.2, 3.3, 13.1, 13.3, 13.4, 13.5_

  - [x] 2.3 Implement Product Detail page metadata
    - Update `src/app/[locale]/products/[id]/page.tsx` `generateMetadata` to fetch product data and produce unique title (product name), description from product description (truncated to 160 chars), OG (type="product", product image or default), Twitter Card, canonical, and hreflang
    - When product not found: set `robots: { index: false }`, omit canonical/hreflang
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 9.2, 13.1, 13.3, 13.4, 13.5_

  - [x] 2.4 Implement About and Contact page metadata
    - Update `src/app/[locale]/about/page.tsx` and `src/app/[locale]/contact/page.tsx` with unique titles, descriptions, OG (type="website"), Twitter Card, canonical, and hreflang
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6, 3.1, 3.2, 3.3, 13.1, 13.3, 13.4, 13.5_

  - [x] 2.5 Implement Cart and Checkout page metadata (non-indexable)
    - Update `src/app/[locale]/cart/page.tsx` and `src/app/[locale]/checkout/page.tsx` to set `robots: { index: false, follow: true }`, omit description, set basic title only
    - _Requirements: 2.5_

  - [x]* 2.6 Write property tests for page metadata (Properties 2, 3, 4, 5, 6)
    - **Property 2: Metadata description length constraint** — descriptions between 50-160 chars for indexable pages
    - **Property 3: Complete OG metadata for indexable pages** — all required OG fields present
    - **Property 4: Twitter Card metadata completeness** — card, title, description, image present
    - **Property 5: OG locale metadata correctness** — correct BCP 47 locale and alternates
    - **Property 6: OG type varies by page type** — "website" for static, "product" for product pages
    - **Validates: Requirements 2.2, 2.3, 2.4, 2.6, 9.1, 9.4, 13.1, 13.3, 13.4, 13.5**

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. JSON-LD structured data components
  - [x] 4.1 Enhance ProductJsonLd component
    - Update `src/components/seo/ProductJsonLd.tsx` to output a complete Schema.org Product object with: @type, name, description, image, brand (Artesena), offers (price, priceCurrency "USD", availability "InStock"), sku (when available), category (when available)
    - _Requirements: 4.1, 4.6_

  - [x] 4.2 Create OrganizationJsonLd component
    - Create `src/components/seo/OrganizationJsonLd.tsx` outputting Schema.org Organization with: name, url, logo, contactPoint, sameAs (social links)
    - _Requirements: 4.2_

  - [x] 4.3 Create WebSiteJsonLd component
    - Create `src/components/seo/WebSiteJsonLd.tsx` outputting Schema.org WebSite with: name, url, potentialAction (SearchAction targeting products page with search_term)
    - _Requirements: 4.3_

  - [x] 4.4 Create BreadcrumbJsonLd component and Breadcrumb navigation
    - Create `src/components/seo/BreadcrumbJsonLd.tsx` outputting Schema.org BreadcrumbList with ordered itemListElement array
    - Create `src/components/seo/Breadcrumb.tsx` rendering semantic `<nav aria-label="Breadcrumb"><ol>...</ol></nav>` with localized links
    - _Requirements: 4.4, 14.3_

  - [x] 4.5 Create ItemListJsonLd component
    - Create `src/components/seo/ItemListJsonLd.tsx` outputting Schema.org ItemList with ListItem entries (position, name, url) for each product
    - _Requirements: 4.5_

  - [x] 4.6 Integrate JSON-LD components into pages
    - Add OrganizationJsonLd and WebSiteJsonLd to Home page
    - Add BreadcrumbJsonLd and Breadcrumb navigation to Product Detail page and Products List page
    - Add ItemListJsonLd to Products List page
    - Ensure ProductJsonLd is rendered on Product Detail page
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x]* 4.7 Write property tests for JSON-LD components (Properties 8, 9, 10)
    - **Property 8: Product JSON-LD completeness** — valid Product schema with all required fields, category conditional
    - **Property 9: BreadcrumbList JSON-LD correctness** — ordered items with localized URLs
    - **Property 10: ItemList JSON-LD correctness** — one ListItem per product with position and URL
    - **Validates: Requirements 4.1, 4.4, 4.5, 4.6**

- [x] 5. Sitemap and robots enhancements
  - [x] 5.1 Enhance sitemap with priority, changefreq, and exclusions
    - Update `src/app/sitemap.ts` to add priority values (1.0 Home, 0.8 Products List, 0.7 Product Detail, 0.6 About/Contact)
    - Add changefreq values (weekly Home, daily Products/Product Detail, monthly About/Contact)
    - Exclude Cart and Checkout pages from sitemap
    - Ensure all entries use localized pathnames (e.g., `/es/productos/1`)
    - Add hreflang alternates for each entry pointing to all locale variants
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [x] 5.2 Update robots.ts with complete disallow rules
    - Update `src/app/robots.ts` to allow root `/` for all user agents
    - Disallow `/api/`, `/admin/`, `/media/`, `/cart`, `/checkout`, `/_next/`
    - Reference sitemap URL using production base URL
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x]* 5.3 Write property test for sitemap entries (Property 11)
    - **Property 11: Sitemap product entries with localized URLs and alternates** — each product entry uses localized pathname and includes alternates for all locales
    - **Validates: Requirements 5.2, 5.6, 5.7**

- [x] 6. Analytics integration enhancements
  - [x] 6.1 Enhance Google Analytics with guards and complete e-commerce events
    - Update `src/lib/analytics.ts` to add `isGaEnabled()` guard checking `GA_ID` and `window.gtag`
    - Ensure all event functions (`gaPageview`, `gaViewItem`, `gaAddToCart`, `gaBeginCheckout`, `gaPurchase`, `gaViewItemList`) are no-ops when GA_ID is empty
    - Verify `view_item` includes item_id, item_name, item_category, price
    - Verify `add_to_cart` includes quantity and value
    - Verify `begin_checkout` maps all cart items
    - Verify `purchase` includes transaction_id, value, currency, items
    - Verify `view_item_list` includes all products with index positions
    - _Requirements: 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

  - [x] 6.2 Enhance Meta Pixel with guards and complete e-commerce events
    - Update `src/lib/fbpixel.ts` to add `isFbEnabled()` guard checking `FB_PIXEL_ID` and `window.fbq`
    - Ensure all event functions (`fbPageview`, `fbViewContent`, `fbAddToCart`, `fbInitiateCheckout`, `fbPurchase`) are no-ops when FB_PIXEL_ID is empty
    - Verify `ViewContent` includes content_ids, content_name, value, currency
    - Verify `AddToCart` includes all fields
    - Verify `InitiateCheckout` includes value and num_items
    - Verify `Purchase` includes value and content_ids
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.7_

  - [x] 6.3 Update locale layout for conditional analytics rendering
    - Update `src/app/[locale]/layout.tsx` to conditionally render GoogleAnalytics component only when `GA_ID` is set
    - Conditionally render Meta Pixel script and `<noscript>` fallback only when `FB_PIXEL_ID` is set
    - Ensure `<noscript>` fallback pixel image is included for Meta Pixel
    - _Requirements: 7.1, 7.8, 8.1, 8.6, 8.7_

  - [x]* 6.4 Write property tests for analytics events (Properties 12, 13)
    - **Property 12: GA e-commerce event correctness** — all GA events include required fields with correct structure
    - **Property 13: FB Pixel e-commerce event correctness** — all FB events include required fields
    - **Validates: Requirements 7.3, 7.4, 7.5, 7.6, 7.7, 8.2, 8.3, 8.4, 8.5**

- [x] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Security headers and performance
  - [x] 8.1 Add security headers in next.config.ts
    - Add `headers()` function to `next.config.ts` returning headers for all routes `/(.*)`
    - Include `X-Content-Type-Options: nosniff`
    - Include `Referrer-Policy: strict-origin-when-cross-origin`
    - Include `X-Frame-Options: DENY`
    - Include Content-Security-Policy allowing analytics scripts (googletagmanager, google-analytics, connect.facebook.net) while blocking unauthorized scripts
    - _Requirements: 15.2, 15.3, 15.4_

  - [x] 8.2 Optimize images for Core Web Vitals
    - Audit all `<img>` and Next.js `<Image>` components across pages
    - Ensure above-the-fold images use `priority` attribute
    - Ensure below-the-fold images use `loading="lazy"`
    - Ensure all images have proper `width`, `height`, and descriptive `alt` attributes
    - _Requirements: 11.1, 11.2, 11.4, 11.6, 12.3_

  - [x]* 8.3 Write property tests for image alt attributes and HTML lang (Properties 15, 16)
    - **Property 15: HTML lang attribute matches locale** — `<html>` lang equals current locale
    - **Property 16: Image alt attributes are descriptive** — all product images have non-empty alt derived from product name
    - **Validates: Requirements 12.3, 12.5**

- [x] 9. Accessibility and navigation SEO
  - [x] 9.1 Ensure semantic heading hierarchy and navigation structure
    - Audit all pages to ensure exactly one `<h1>` per page
    - Ensure heading hierarchy is sequential (h1 → h2 → h3) without skipping levels
    - Ensure main navigation renders as `<nav>` element with `aria-label`
    - Ensure all interactive elements have accessible names
    - _Requirements: 12.1, 12.2, 12.4, 14.1_

  - [x] 9.2 Ensure internal links use localized pathnames
    - Verify all internal links in navigation and page content use localized pathnames matching the current locale
    - Ensure no broken internal links exist (all href values resolve to valid pages)
    - _Requirements: 14.2, 14.4_

  - [x]* 9.3 Write property test for internal link localization (Property 14)
    - **Property 14: Internal links use localized pathnames** — all navigation links contain locale prefix and use localized pathname from routing config
    - **Validates: Requirements 14.2**

- [x] 10. URL structure and locale handling verification
  - [x] 10.1 Verify locale routing and redirects
    - Ensure `next-intl` middleware correctly redirects requests to locale-prefixed versions
    - Verify rewrites in `next.config.ts` map all localized paths to internal route equivalents
    - Ensure root path `/` redirects to default locale `/en`
    - Verify all routes serve localized pathnames (e.g., `/es/productos`, `/fr/produits`)
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 10.2 Add default OG brand image
    - Create or verify existence of `/public/img/og-default.jpg` (1200x630 pixels) as the fallback OG image for pages without specific images
    - _Requirements: 9.1, 9.3_

- [x] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The project uses `vitest` as test runner and `fast-check` for property-based testing (both already configured)
- All code is TypeScript targeting the existing Next.js 16 App Router structure in `frontend/src/`
- Existing files to modify: `src/app/layout.tsx`, `src/lib/seo.ts`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/lib/analytics.ts`, `src/lib/fbpixel.ts`, `src/app/[locale]/layout.tsx`, `next.config.ts`
- New files to create: `src/components/seo/OrganizationJsonLd.tsx`, `src/components/seo/WebSiteJsonLd.tsx`, `src/components/seo/BreadcrumbJsonLd.tsx`, `src/components/seo/ItemListJsonLd.tsx`, `src/components/seo/Breadcrumb.tsx`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "2.1", "2.2", "2.4", "2.5", "5.2"] },
    { "id": 2, "tasks": ["2.3", "4.1", "4.2", "4.3", "4.5", "5.1"] },
    { "id": 3, "tasks": ["2.6", "4.4", "5.3", "6.1", "6.2"] },
    { "id": 4, "tasks": ["4.6", "4.7", "6.3", "6.4"] },
    { "id": 5, "tasks": ["8.1", "8.2", "10.2"] },
    { "id": 6, "tasks": ["8.3", "9.1", "9.2", "10.1"] },
    { "id": 7, "tasks": ["9.3"] }
  ]
}
```
