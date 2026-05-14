# Implementation Plan: SEO & Localized URLs

## Overview

This plan implements comprehensive SEO optimization and localized URL pathnames for the Artesena e-commerce platform. The implementation is broken into incremental steps: routing configuration with localized pathnames, SEO utility infrastructure, page-level metadata generation, sitemap/robots, structured data, section-based routing for About/Contact, and Django admin enhancements.

## Tasks

- [x] 1. Set up routing configuration and navigation utilities
  - [x] 1.1 Update routing config with localized pathnames
    - Modify `frontend/src/i18n/routing.ts` to add the `pathnames` map with translations for all routes (/, /products, /products/[id], /cart, /about, /checkout, /contact) across en, es, fr
    - Export `Pathnames` and `AppLocale` types from the routing config
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 1.2 Create navigation utilities module
    - Create `frontend/src/lib/navigation.ts` using `createNavigation(routing)` from next-intl
    - Export `Link`, `redirect`, `usePathname`, `useRouter`, `getPathname` helpers
    - _Requirements: 4.7, 4.8_

  - [x] 1.3 Add NEXT_PUBLIC_BASE_URL environment variable
    - Add `NEXT_PUBLIC_BASE_URL` to `.env.local` (or equivalent) with fallback logic
    - _Requirements: 9.1, 9.4_

- [x] 2. Implement SEO utility infrastructure
  - [x] 2.1 Create SEO utilities module
    - Create `frontend/src/lib/seo.ts` with `getBaseUrl()`, `getAlternateLinks(pathname, locale)`, and `getCommonMetadata(locale)` functions
    - `getBaseUrl()` returns `NEXT_PUBLIC_BASE_URL` or falls back to `http://localhost:3000`
    - `getAlternateLinks()` generates canonical URL (absolute, no query params) and hreflang links for all locales using localized pathnames from routing config
    - `getCommonMetadata()` returns shared metadata fields (og:locale, alternateLocale array in BCP 47 format)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 1.3, 1.4_

  - [x] 2.2 Write property tests for canonical URL generation
    - **Property 4: Canonical URL Correctness**
    - Test that for any pathname, locale, and query params, canonical URL starts with base URL, contains locale prefix, uses localized pathname, and has no query params
    - **Validates: Requirements 9.1, 9.4, 11.1**

  - [x] 2.3 Write property tests for hreflang completeness
    - **Property 5: Hreflang Completeness**
    - Test that for any pathname, hreflang set contains one entry per locale with correct localized pathname plus x-default pointing to English version
    - **Validates: Requirements 9.2, 9.3, 11.2**

  - [x] 2.4 Write property tests for pathname translation
    - **Property 3: Pathname Translation Preserves Structure**
    - Test that translating any pathname (including dynamic segments) to any locale produces correct localized segment, preserves dynamic values, and prepends locale prefix
    - **Validates: Requirements 4.7, 4.8**

- [x] 3. Checkpoint - Ensure routing and SEO utilities work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement page-level metadata generation
  - [x] 4.1 Add generateMetadata to Home Page
    - Convert `frontend/src/app/[locale]/page.tsx` to export `generateMetadata` with title containing "Artesena" + locale tagline, description, OG tags (title, description, image, url, type "website", locale BCP 47), and alternateLocale for other locales
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 4.2 Add generateMetadata to Products List Page
    - Update `frontend/src/app/[locale]/products/page.tsx` to export `generateMetadata` with title containing translated page name + product count, description summarizing catalog, OG tags, and alternateLocale
    - Split into server component (metadata) + client component (interactivity) if currently using "use client"
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 4.3 Add generateMetadata to Cart Page
    - Update `frontend/src/app/[locale]/cart/page.tsx` to export `generateMetadata` with dynamic title (item count or empty state), OG tags with localized cart path, and robots "noindex, nofollow"
    - Split into server component + client component if needed
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 4.4 Add generateMetadata to Product Detail Page
    - Verify/update `frontend/src/app/[locale]/products/[id]/page.tsx` to include canonical URL, hreflang alternates, twitter:card "summary_large_image", and handle product-not-found with noindex
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [x] 4.5 Write property tests for OG metadata completeness
    - **Property 1: OG Metadata Completeness**
    - Test that for any page type and locale, metadata contains non-empty og:title, og:description, og:url (with locale prefix), og:type, and og:locale in BCP 47 format
    - **Validates: Requirements 1.3, 3.3**

  - [x] 4.6 Write property tests for alternate locale completeness
    - **Property 2: Alternate Locale Completeness**
    - Test that for any locale, alternateLocale array contains exactly the BCP 47 codes of all other supported locales (count = totalLocales - 1)
    - **Validates: Requirements 1.4, 3.4**

- [x] 5. Implement section-based About and Contact pages
  - [x] 5.1 Create About page with section routing and metadata
    - Update `frontend/src/app/[locale]/about/page.tsx` to export `generateMetadata` with About-specific title, description, and OG tags distinct from home page
    - Render About section content as a full page (shared component with home page section)
    - Ensure SSR renders full content without JS-dependent scrolling
    - _Requirements: 5.1, 5.3, 5.5, 5.6_

  - [x] 5.2 Create Contact page with section routing and metadata
    - Create `frontend/src/app/[locale]/contact/page.tsx` with `generateMetadata` for Contact-specific metadata distinct from home page
    - Render Contact section content as a full page (shared component with home page section)
    - Ensure SSR renders full content without JS-dependent scrolling
    - _Requirements: 5.2, 5.4, 5.5, 5.6_

- [x] 6. Checkpoint - Ensure all page metadata works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement SEO infrastructure (Sitemap, Robots, JSON-LD)
  - [x] 7.1 Create dynamic sitemap generator
    - Create `frontend/src/app/sitemap.ts` that fetches all products from Django API, generates entries for all static pages × all locales with localized pathnames, includes xhtml:link hreflang alternates per entry, and sets lastmod from product `updated_at`
    - Handle API errors gracefully (return static pages only if products API fails)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [x] 7.2 Create robots.txt configuration
    - Create `frontend/src/app/robots.ts` that allows all user agents on public paths, disallows /api/, /admin/, /media/, and references absolute sitemap URL
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 7.3 Create JSON-LD structured data component
    - Create `frontend/src/components/seo/ProductJsonLd.tsx` as a server component that renders `<script type="application/ld+json">` with Schema.org Product markup
    - Include name, description, brand "Artesena", offers (price, USD, InStock), conditional image array
    - Integrate into product detail page
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [x] 7.4 Write property tests for JSON-LD product validity
    - **Property 6: JSON-LD Product Validity**
    - Test that for any valid product data, JSON-LD has @type "Product", correct name/description, brand "Artesena", offers with price/USD/InStock, conditional image array
    - **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6**

  - [x] 7.5 Write property tests for sitemap entry completeness
    - **Property 7: Sitemap Entry Completeness**
    - Test that for any set of products and static pages, sitemap contains exactly (staticPageCount + productCount) × localeCount entries with correct localized pathnames and hreflang alternates
    - **Validates: Requirements 7.2, 7.3, 7.5**

  - [x] 7.6 Write property tests for sitemap lastmod accuracy
    - **Property 8: Sitemap Lastmod Accuracy**
    - Test that for any product with a known updated_at timestamp, the sitemap entry's lastModified equals that timestamp
    - **Validates: Requirements 7.6**

  - [x] 7.7 Write property tests for OG image absolute URLs
    - **Property 10: OG Image URLs Are Absolute**
    - Test that for any product with images, OG image URLs start with http:// or https://
    - **Validates: Requirements 12.4**

- [x] 8. Checkpoint - Ensure SEO infrastructure works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement Django Cart Admin enhancements
  - [x] 9.1 Enhance CartAdmin with computed columns and filtering
    - Update `backend/apps/orders/admin.py` to add `item_count` (annotated queryset with Count), `total_value` (annotated with Sum of item prices × quantities), `list_filter` with date range on `created_at`, and header showing active cart count
    - Update `list_display` to include id, session_id, item_count, total_value, created_at
    - _Requirements: 6.1, 6.2, 6.3, 6.6_

  - [x] 9.2 Add session_id format validation to Cart Service
    - Update the Cart add-item endpoint in `backend/apps/orders/views.py` to validate session_id format matches `session_{timestamp}_{alphanumeric}` pattern
    - Return 400 with descriptive error message for invalid format
    - _Requirements: 6.4, 6.5_

  - [x] 9.3 Write property test for session ID format validation
    - **Property 9: Session ID Format Validation**
    - Test that for any string not matching `session_\d+_[a-z0-9]{9}`, the cart add-item endpoint returns 400
    - **Validates: Requirements 6.5**

- [x] 10. Update existing components to use localized navigation
  - [x] 10.1 Replace Link imports with locale-aware navigation
    - Update all components (Navbar, product cards, cart links, etc.) to import `Link` from `@/lib/navigation` instead of `next/link` or `next-intl/link`
    - Ensure all internal links use the typed pathname keys from routing config
    - _Requirements: 4.6, 4.7, 4.8_

  - [x] 10.2 Add image optimization attributes
    - Ensure all product images use Next.js Image component with proper width, height, alt attributes
    - Apply `loading="lazy"` for below-fold images
    - Ensure OG images use absolute URLs
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [x] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The frontend uses TypeScript with Next.js App Router and next-intl
- The backend uses Python with Django
- Property-based tests use fast-check (TypeScript) and should be placed in `frontend/src/__tests__/seo/`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.3"] },
    { "id": 1, "tasks": ["1.2", "2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4"] },
    { "id": 3, "tasks": ["4.1", "4.2", "4.3", "4.4", "5.1", "5.2"] },
    { "id": 4, "tasks": ["4.5", "4.6", "7.1", "7.2", "7.3"] },
    { "id": 5, "tasks": ["7.4", "7.5", "7.6", "7.7"] },
    { "id": 6, "tasks": ["9.1", "9.2"] },
    { "id": 7, "tasks": ["9.3", "10.1", "10.2"] }
  ]
}
```
