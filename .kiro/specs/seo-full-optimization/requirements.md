# Requirements Document

## Introduction

This document specifies the requirements for a comprehensive SEO optimization audit and implementation for the Artesena e-commerce platform. Artesena is a Next.js 16 + Django 6 application selling handcrafted Bolivian artisan instruments (charangos, ronrocos, walaychos). The platform supports three locales (en, es, fr) with localized URL pathnames. The goal is to ensure every SEO signal is correct, complete, and optimized to achieve maximum search engine visibility and ranking for relevant queries related to Bolivian artisan instruments.

## Glossary

- **SEO_System**: The collection of metadata, structured data, sitemaps, robots configuration, analytics integrations, and performance optimizations in the Artesena frontend and backend
- **Metadata_Generator**: The `generateMetadata` functions in Next.js page components that produce `<title>`, `<meta description>`, Open Graph, and Twitter Card tags
- **Sitemap_Generator**: The `sitemap.ts` module that produces the XML sitemap for all localized pages and product URLs
- **Robots_Config**: The `robots.ts` module that produces the robots.txt directives for search engine crawlers
- **JSON_LD_Renderer**: The server components that output `<script type="application/ld+json">` structured data markup
- **Analytics_Integration**: The Google Analytics (GA4) and Meta Pixel tracking scripts and event functions
- **Canonical_Resolver**: The `getAlternateLinks` utility that computes canonical URLs and hreflang alternate links
- **Core_Web_Vitals**: Google's page experience metrics including Largest Contentful Paint (LCP), First Input Delay (FID), and Cumulative Layout Shift (CLS)
- **Locale**: One of the supported languages: en (English), es (Spanish), fr (French)
- **Product_Page**: The dynamic route `/[locale]/products/[id]` displaying a single product
- **Products_List_Page**: The route `/[locale]/products` displaying all available products
- **Static_Pages**: Home, About, Contact pages that do not depend on dynamic product data

## Requirements

### Requirement 1: Root Layout Default Metadata

**User Story:** As a site owner, I want the root layout to have proper default metadata for Artesena instead of placeholder text, so that search engines always see relevant brand information even if a page fails to set its own metadata.

#### Acceptance Criteria

1. THE SEO_System SHALL set the default `title` in the root layout metadata to "Artesena | Handcrafted Bolivian Instruments"
2. THE SEO_System SHALL set the default `description` in the root layout metadata to a concise summary of the Artesena brand and product offering
3. THE SEO_System SHALL include a `metadataBase` URL property in the root layout pointing to the production domain

### Requirement 2: Complete Page-Level Metadata

**User Story:** As a site owner, I want every public page to have complete and unique metadata (title, description, Open Graph, Twitter Card), so that search engines and social platforms display rich, accurate previews.

#### Acceptance Criteria

1. THE Metadata_Generator SHALL produce a unique `title` tag for each page (Home, Products List, Product Detail, About, Contact, Cart, Checkout)
2. THE Metadata_Generator SHALL produce a unique `description` meta tag of 50-160 characters for each indexable page
3. THE Metadata_Generator SHALL produce Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `og:locale`, `og:site_name`) for each indexable page
4. THE Metadata_Generator SHALL produce Twitter Card tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`) for each indexable page
5. WHEN a page is non-indexable (Cart, Checkout), THE Metadata_Generator SHALL set `robots: { index: false, follow: true }` and omit `description`
6. THE Metadata_Generator SHALL set `og:site_name` to "Artesena" on all pages

### Requirement 3: Canonical URLs and Hreflang Alternates

**User Story:** As a site owner, I want every page to declare a self-referencing canonical URL and hreflang alternates for all supported locales, so that search engines consolidate ranking signals and serve the correct language version.

#### Acceptance Criteria

1. THE Canonical_Resolver SHALL produce a self-referencing canonical URL for every page using the absolute production URL with the correct locale prefix and localized pathname
2. THE Canonical_Resolver SHALL produce hreflang alternate links for all three locales (en, es, fr) using BCP 47 language tags
3. THE Canonical_Resolver SHALL produce an `x-default` hreflang link pointing to the English (default locale) version
4. WHEN a product does not exist, THE Metadata_Generator SHALL omit canonical and hreflang alternates and set `robots: { index: false }`

### Requirement 4: Structured Data (JSON-LD)

**User Story:** As a site owner, I want comprehensive JSON-LD structured data on relevant pages, so that search engines display rich results (product cards, breadcrumbs, organization info, site search).

#### Acceptance Criteria

1. THE JSON_LD_Renderer SHALL output a valid Schema.org `Product` object on every Product_Page including: name, description, image, brand, offers (price, currency, availability), and SKU when available
2. THE JSON_LD_Renderer SHALL output a valid Schema.org `Organization` object on the Home page including: name, url, logo, contactPoint, and sameAs (social links)
3. THE JSON_LD_Renderer SHALL output a valid Schema.org `WebSite` object on the Home page including: name, url, and potentialAction with a SearchAction targeting the products page
4. THE JSON_LD_Renderer SHALL output a valid Schema.org `BreadcrumbList` object on Product_Page and Products_List_Page reflecting the navigation hierarchy
5. THE JSON_LD_Renderer SHALL output a valid Schema.org `ItemList` object on the Products_List_Page containing references to each product
6. IF a product has a category, THEN THE JSON_LD_Renderer SHALL include the category in the Product structured data

### Requirement 5: Sitemap Completeness and Correctness

**User Story:** As a site owner, I want the sitemap to include all indexable pages with correct localized URLs, priorities, and change frequencies, so that search engines discover and crawl all content efficiently.

#### Acceptance Criteria

1. THE Sitemap_Generator SHALL include entries for all static pages (Home, Products List, About, Contact) in all three locales
2. THE Sitemap_Generator SHALL include entries for all active product detail pages in all three locales
3. THE Sitemap_Generator SHALL exclude non-indexable pages (Cart, Checkout) from the sitemap
4. THE Sitemap_Generator SHALL set `priority` values: 1.0 for Home, 0.8 for Products List, 0.7 for Product Detail, 0.6 for About and Contact
5. THE Sitemap_Generator SHALL set `changefreq` values: "daily" for Products List and Product Detail, "weekly" for Home, "monthly" for About and Contact
6. THE Sitemap_Generator SHALL use localized pathnames in URLs (e.g., `/es/productos/1` not `/es/products/1`)
7. THE Sitemap_Generator SHALL include `alternates` with hreflang for each entry pointing to all locale variants

### Requirement 6: Robots.txt Configuration

**User Story:** As a site owner, I want robots.txt to correctly allow indexing of public content and block private/admin areas, so that search engines focus crawl budget on valuable pages.

#### Acceptance Criteria

1. THE Robots_Config SHALL allow all user agents to crawl the root path `/`
2. THE Robots_Config SHALL disallow crawling of `/api/`, `/admin/`, `/media/`, `/cart`, and `/checkout` paths
3. THE Robots_Config SHALL reference the sitemap URL using the production base URL
4. THE Robots_Config SHALL disallow crawling of `/_next/` static asset paths to prevent index bloat

### Requirement 7: Google Analytics Integration

**User Story:** As a site owner, I want Google Analytics 4 to be properly integrated with enhanced e-commerce tracking, so that I can measure user behavior, conversions, and revenue accurately.

#### Acceptance Criteria

1. THE Analytics_Integration SHALL load the Google Analytics gtag.js script on every page using the `@next/third-parties/google` GoogleAnalytics component
2. THE Analytics_Integration SHALL fire a `page_view` event on every route navigation including the localized page path
3. THE Analytics_Integration SHALL fire a `view_item` event with product details when a user views a Product_Page
4. THE Analytics_Integration SHALL fire an `add_to_cart` event with item details and value when a user adds a product to the cart
5. THE Analytics_Integration SHALL fire a `begin_checkout` event with cart contents when a user navigates to the Checkout page
6. THE Analytics_Integration SHALL fire a `purchase` event with transaction ID, revenue, and item details when an order is confirmed
7. THE Analytics_Integration SHALL fire a `view_item_list` event with product array when a user views the Products_List_Page
8. WHEN the GA_ID environment variable is empty, THE Analytics_Integration SHALL not render the analytics script or fire events

### Requirement 8: Meta Pixel Integration

**User Story:** As a site owner, I want Meta Pixel to be properly integrated with standard e-commerce events, so that I can run targeted advertising campaigns and measure conversions on Facebook and Instagram.

#### Acceptance Criteria

1. THE Analytics_Integration SHALL load the Meta Pixel base code script on every page and fire a `PageView` event
2. THE Analytics_Integration SHALL fire a `ViewContent` event with product details when a user views a Product_Page
3. THE Analytics_Integration SHALL fire an `AddToCart` event with product details and value when a user adds a product to the cart
4. THE Analytics_Integration SHALL fire an `InitiateCheckout` event with cart value when a user navigates to the Checkout page
5. THE Analytics_Integration SHALL fire a `Purchase` event with order value when an order is confirmed
6. THE Analytics_Integration SHALL include a `<noscript>` fallback pixel image for tracking users without JavaScript
7. WHEN the FB_PIXEL_ID environment variable is empty, THE Analytics_Integration SHALL not render the pixel script or fire events

### Requirement 9: Open Graph Image Optimization

**User Story:** As a site owner, I want optimized Open Graph images for all pages, so that social media shares display visually appealing previews that drive click-through.

#### Acceptance Criteria

1. THE Metadata_Generator SHALL specify an `og:image` with dimensions of at least 1200x630 pixels for all indexable pages
2. WHEN a Product_Page has product images, THE Metadata_Generator SHALL use the first product image as the `og:image`
3. WHEN a page does not have a specific image, THE Metadata_Generator SHALL use a default Artesena brand image as the `og:image`
4. THE Metadata_Generator SHALL include `og:image:width`, `og:image:height`, and `og:image:alt` properties for each Open Graph image

### Requirement 10: URL Structure and Localization

**User Story:** As a site owner, I want all URLs to use clean, localized, SEO-friendly pathnames, so that search engines understand the content language and users see familiar words in URLs.

#### Acceptance Criteria

1. THE SEO_System SHALL serve localized pathnames for all routes (e.g., `/es/productos`, `/fr/produits`, `/en/products`)
2. THE SEO_System SHALL ensure the next-intl middleware correctly redirects requests to the locale-prefixed version
3. THE SEO_System SHALL ensure rewrites in next.config.ts map all localized paths to their internal route equivalents
4. IF a user accesses the root path `/` without a locale prefix, THEN THE SEO_System SHALL redirect to the default locale prefix `/en`

### Requirement 11: Core Web Vitals and Performance

**User Story:** As a site owner, I want the site to pass Core Web Vitals thresholds, so that Google's page experience signals contribute positively to search rankings.

#### Acceptance Criteria

1. THE SEO_System SHALL ensure Largest Contentful Paint (LCP) is under 2.5 seconds on all pages
2. THE SEO_System SHALL ensure Cumulative Layout Shift (CLS) is under 0.1 on all pages
3. THE SEO_System SHALL ensure First Input Delay (FID) / Interaction to Next Paint (INP) is under 200ms on all pages
4. THE SEO_System SHALL use Next.js Image component with proper `width`, `height`, and `priority` attributes for above-the-fold images to prevent layout shift
5. THE SEO_System SHALL preconnect to external origins (fonts, API, analytics) in the document head
6. THE SEO_System SHALL use `loading="lazy"` for below-the-fold images

### Requirement 12: Accessibility for SEO

**User Story:** As a site owner, I want the site to follow accessibility best practices that also benefit SEO, so that search engines can better understand page structure and content.

#### Acceptance Criteria

1. THE SEO_System SHALL ensure every page has exactly one `<h1>` heading element
2. THE SEO_System SHALL ensure heading hierarchy is sequential (h1 → h2 → h3) without skipping levels
3. THE SEO_System SHALL ensure all images have descriptive `alt` attributes
4. THE SEO_System SHALL ensure all interactive elements (links, buttons) have accessible names
5. THE SEO_System SHALL ensure the `<html>` element has a `lang` attribute matching the current locale

### Requirement 13: Social Media and Sharing Optimization

**User Story:** As a site owner, I want complete social sharing metadata for all major platforms, so that shared links display rich previews on Twitter, Facebook, LinkedIn, and messaging apps.

#### Acceptance Criteria

1. THE Metadata_Generator SHALL include `twitter:card` set to "summary_large_image" for all indexable pages
2. THE Metadata_Generator SHALL include `twitter:site` with the Artesena Twitter handle when configured
3. THE Metadata_Generator SHALL include `og:type` set to "website" for static pages and "product" for Product_Pages
4. THE Metadata_Generator SHALL include `og:locale` using BCP 47 format matching the current page locale
5. THE Metadata_Generator SHALL include `og:locale:alternate` for all other supported locales

### Requirement 14: Internal Linking and Navigation SEO

**User Story:** As a site owner, I want proper internal linking structure with semantic HTML navigation, so that search engines can discover all pages and understand site hierarchy.

#### Acceptance Criteria

1. THE SEO_System SHALL render the main navigation as a `<nav>` element with an `aria-label`
2. THE SEO_System SHALL ensure all internal links use localized pathnames matching the current locale
3. THE SEO_System SHALL include a breadcrumb navigation on Product_Page and Products_List_Page using an `<ol>` list with Schema.org BreadcrumbList markup
4. THE SEO_System SHALL ensure no broken internal links exist (all href values resolve to valid pages)

### Requirement 15: Security Headers for SEO Trust

**User Story:** As a site owner, I want proper security headers configured, so that search engines recognize the site as trustworthy and browsers do not block content.

#### Acceptance Criteria

1. THE SEO_System SHALL serve pages over HTTPS in production
2. THE SEO_System SHALL include an `X-Content-Type-Options: nosniff` response header
3. THE SEO_System SHALL include a `Referrer-Policy: strict-origin-when-cross-origin` response header
4. THE SEO_System SHALL configure Content Security Policy headers that allow analytics scripts (Google Analytics, Meta Pixel) while blocking unauthorized scripts
