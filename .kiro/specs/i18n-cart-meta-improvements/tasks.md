# Implementation Plan: i18n, Cart, Meta & Checkout Improvements

## Overview

This plan implements four interconnected improvement areas for the Artesena e-commerce platform: next-intl i18n framework integration with locale routing, session-based cart consistency with translation support, Meta Pixel commerce enhancement with Open Graph tags, and checkout form address improvements. The frontend uses TypeScript (Next.js 16 + App Router) and the backend uses Python (Django 6 + DRF).

## Tasks

- [x] 1. Set up i18n configuration and middleware
  - [x] 1.1 Create the i18n configuration module (`src/lib/i18n.ts`)
    - Define `locales` array as `["en", "es", "fr"]` with `as const`
    - Export `Locale` type, `defaultLocale` as `"en"`
    - Export `localeToBcp47` mapping (`en→en_US`, `es→es_ES`, `fr→fr_FR`)
    - Implement `getMessages(locale)` function with dynamic import and fallback to default locale with console warning
    - _Requirements: 1.1, 1.6, 8.1, 8.4_

  - [x] 1.2 Create the next-intl middleware (`middleware.ts`)
    - Import `locales` and `defaultLocale` from `src/lib/i18n.ts`
    - Configure `createMiddleware` from `next-intl/middleware` with `localePrefix: "always"`
    - Set matcher config to exclude `_next/`, `favicon.ico`, `admin`, `media/`, `static/`
    - Ensure unsupported locale prefixes redirect (307) to default locale preserving query params
    - _Requirements: 2.1, 2.2, 2.6, 2.7_

  - [x] 1.3 Create the locale layout provider (`src/app/[locale]/layout.tsx`)
    - Create `[locale]` dynamic route segment layout
    - Load messages via `getMessages(locale)` and wrap children with `NextIntlClientProvider`
    - Set `html lang` attribute to current locale
    - Validate locale param against supported locales, redirect to default if invalid
    - _Requirements: 1.1, 1.2, 2.2_

  - [ ]* 1.4 Write property tests for middleware locale redirect (Property 3)
    - **Property 3: Middleware locale redirect**
    - Use fast-check to generate arbitrary URL paths without locale prefix and verify 307 redirect to `/en/{path}` preserving query params
    - **Validates: Requirements 2.1, 2.6**

  - [ ]* 1.5 Write property tests for middleware path exclusion (Property 6)
    - **Property 6: Middleware path exclusion**
    - Use fast-check to generate paths matching excluded patterns and verify no redirect occurs
    - **Validates: Requirements 2.7**

- [x] 2. Create translation files and translation resolution logic
  - [x] 2.1 Create English translation file (`src/messages/en.json`)
    - Define all namespaced sections: `navbar`, `home`, `products`, `cart`, `checkout`, `about`, `common`
    - Use 2-level max nesting depth (`section.key` format)
    - Include all keys defined in the design document's Translation File Schema
    - _Requirements: 1.5, 1.7, 8.5_

  - [x] 2.2 Create Spanish translation file (`src/messages/es.json`)
    - Mirror exact key structure from `en.json`
    - Provide Spanish translations for all keys
    - _Requirements: 1.5, 1.7_

  - [x] 2.3 Create French translation file (`src/messages/fr.json`)
    - Mirror exact key structure from `en.json`
    - Provide French translations for all keys
    - _Requirements: 1.5, 1.7_

  - [ ]* 2.4 Write property tests for translation file structural consistency (Property 2)
    - **Property 2: Translation file structural consistency**
    - Verify every key in `en.json` exists in `es.json` and `fr.json`
    - **Validates: Requirements 1.7**

  - [ ]* 2.5 Write property tests for translation resolution with fallback (Property 1)
    - **Property 1: Translation resolution with fallback**
    - Use fast-check to generate arbitrary keys and locales, verify fallback chain: locale → default → key string
    - **Validates: Requirements 1.2, 1.3, 1.4**

  - [ ]* 2.6 Write property tests for translation file max nesting depth (Property 17)
    - **Property 17: Translation file max nesting depth**
    - Verify no key path in any translation file exceeds 2 levels of nesting
    - **Validates: Requirements 8.5**

- [x] 3. Implement navbar language selector and locale-aware navigation
  - [x] 3.1 Update the navbar component with a language selector
    - Import `locales` from `src/lib/i18n.ts` to dynamically render locale options
    - Use `useTranslations("navbar")` for translated labels
    - Implement locale switch that navigates to same path with new locale prefix preserving query params
    - Ensure all internal links include current locale prefix
    - _Requirements: 2.3, 2.4, 8.2_

  - [x] 3.2 Update all internal navigation to be locale-aware
    - Ensure `Link` components and `router.push` calls use locale-prefixed paths
    - Use `usePathname` and `useRouter` from `next-intl/navigation` for locale-aware routing
    - _Requirements: 2.3, 2.4_

  - [ ]* 3.3 Write property tests for locale preservation in navigation (Property 4)
    - **Property 4: Locale preservation in navigation**
    - Verify all generated links contain current locale prefix and locale switch only changes prefix
    - **Validates: Requirements 2.3, 2.4**

  - [ ]* 3.4 Write property tests for dynamic locale configuration (Property 16)
    - **Property 16: Dynamic locale configuration**
    - Verify navbar renders option for every locale in config array
    - **Validates: Requirements 8.2, 8.3**

- [x] 4. Checkpoint - Ensure i18n foundation works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement product content translation display
  - [x] 5.1 Update the API service to pass `lang` query parameter
    - Modify all product-related API calls (products list, product detail, categories, options) to include `?lang={locale}` from current route locale
    - Update the cart API `get` method to accept and pass `lang` parameter
    - _Requirements: 2.5, 3.1, 3.2, 3.4_

  - [x] 5.2 Update product list page to use translations and locale-aware API
    - Use `useTranslations("products")` for UI text
    - Fetch products with current locale as `lang` param
    - Display translated product names and descriptions from API response
    - Handle API failure: show last loaded content or translated error message with retry
    - _Requirements: 3.1, 3.6_

  - [x] 5.3 Update product detail page to use translations and locale-aware API
    - Fetch product data with current locale as `lang` param
    - Display translated product name, description, category, options, and option values
    - Re-fetch on locale switch without full page reload
    - Handle API failure gracefully
    - _Requirements: 3.2, 3.5, 3.6_

  - [ ]* 5.4 Write property tests for API calls include locale parameter (Property 5)
    - **Property 5: API calls include locale parameter**
    - Verify all product API calls from locale-prefixed routes include matching `lang` param
    - **Validates: Requirements 2.5**

- [x] 6. Enhance backend cart service with translation support
  - [x] 6.1 Update CartViewSet `retrieve` to support `lang` query parameter
    - Read `lang` from `request.query_params`
    - Pass `lang` to serializer context
    - If `lang` translation exists for product, return translated name; otherwise return base product name
    - _Requirements: 4.6, 4.7_

  - [x] 6.2 Update CartSerializer to return translated product names
    - In `CartItemSerializer`, look up `ProductTranslation` for the item's product and the context `lang`
    - Fall back to `product.name` if no translation record exists
    - Return same response structure regardless of translation availability
    - _Requirements: 4.6, 4.7_

  - [x] 6.3 Add cart quantity validation (1-99 range)
    - Validate quantity in `add_item` and `update_item` actions
    - Reject requests with quantity < 1 or > 99 with 400 error
    - Preserve existing item quantity on rejection
    - _Requirements: 4.2, 4.5_

  - [x] 6.4 Ensure cart creation on missing session_id
    - When `retrieve` is called with a session_id that doesn't exist, create a new empty Cart
    - Return empty items list and total of 0
    - _Requirements: 4.4_

  - [ ]* 6.5 Write property tests for cart session isolation and creation (Property 8)
    - **Property 8: Cart session isolation and creation**
    - Use hypothesis to verify distinct session_ids never share items and new session_ids return empty carts
    - **Validates: Requirements 4.1, 4.4**

  - [ ]* 6.6 Write property tests for cart add item correctness (Property 9)
    - **Property 9: Cart add item correctness**
    - Use hypothesis to verify items added with valid quantity are retrievable with correct data
    - **Validates: Requirements 4.2**

  - [ ]* 6.7 Write property tests for cart quantity validation (Property 10)
    - **Property 10: Cart quantity validation**
    - Use hypothesis to verify quantities outside 1-99 are rejected and existing quantity preserved
    - **Validates: Requirements 4.5**

  - [ ]* 6.8 Write property tests for cart translation with fallback (Property 11)
    - **Property 11: Cart translation with fallback**
    - Use hypothesis to verify cart returns translated names when available, base name otherwise
    - **Validates: Requirements 4.6, 4.7**

  - [ ]* 6.9 Write property tests for backend product translation fallback (Property 7)
    - **Property 7: Backend product translation fallback**
    - Use hypothesis to verify API returns translated data when available, base data otherwise
    - **Validates: Requirements 3.3**

- [x] 7. Checkpoint - Ensure backend cart and translation logic works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement cart UI translation
  - [x] 8.1 Update cart page with translated UI text
    - Use `useTranslations("cart")` for all static text
    - Display translated empty state (heading, description, "View Products" button)
    - Display translated labels: "Remove", "Summary", "Subtotal", "Total", "Proceed to Checkout"
    - Display translated remove confirmation prompt
    - Ensure session_id is preserved across locale switches (read from localStorage)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 4.3_

  - [ ]* 8.2 Write unit tests for cart page translated UI
    - Test empty state renders translated heading and description
    - Test cart with items renders translated labels
    - Test locale switch preserves session_id
    - **Validates: Requirements 5.1, 5.2, 5.3, 4.3**

- [x] 9. Implement checkout form address improvements
  - [x] 9.1 Create structured address form component
    - Replace single textarea with separate fields: street (max 200, required), city (max 100, required), state (max 100, optional), country (select from predefined list, required), postal code (max 20, optional)
    - Use `useTranslations("checkout")` for labels, placeholders, and helper text
    - Display helper text about complete address for international delivery from Bolivia
    - Implement `formatAddress()` concatenation: street, city, state, postalCode, country (filter empty, join with ", ")
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.7_

  - [x] 9.2 Implement checkout form validation
    - Mark street, city, country as required
    - Prevent submission if any required field is empty
    - Display inline validation message below each empty required field
    - Send concatenated address string to backend on valid submission
    - _Requirements: 6.5, 6.6_

  - [ ]* 9.3 Write property tests for address field concatenation (Property 12)
    - **Property 12: Address field concatenation**
    - Use fast-check to generate arbitrary address field values and verify concatenation produces correct comma-separated string with non-empty fields in order
    - **Validates: Requirements 6.4**

  - [ ]* 9.4 Write property tests for checkout required field validation (Property 13)
    - **Property 13: Checkout required field validation**
    - Use fast-check to generate subsets of empty required fields and verify form prevents submission with inline errors
    - **Validates: Requirements 6.6**

- [x] 10. Implement Meta Pixel commerce enhancement
  - [x] 10.1 Implement `generateMetadata` for product detail pages with OG tags
    - Generate `og:title` (product name, max 95 chars truncated with "...")
    - Generate `og:description` (product description, max 200 chars truncated with "...")
    - Generate `og:image` (first image URL, omit if no images)
    - Generate `og:url` as `/[locale]/products/[id]`
    - Set `og:type` to `"og:product"`
    - Generate `product:price:amount`, `product:price:currency` ("USD"), `product:availability` ("in stock")
    - Generate `og:locale` with BCP 47 value for current locale
    - Generate `og:locale:alternate` for all other supported locales
    - Ensure server-rendered HTML contains all OG tags (no client-side JS required)
    - _Requirements: 7.1, 7.2, 7.4, 7.5, 7.6, 7.7_

  - [x] 10.2 Implement Meta Pixel ViewContent event on product pages
    - Fire `ViewContent` event on product page load with: `content_ids` (array with product id), `content_name` (product name), `content_type` ("product"), `value` (base_price as number), `currency` ("USD")
    - _Requirements: 7.3_

  - [ ]* 10.3 Write property tests for product page OG meta tags (Property 14)
    - **Property 14: Product page OG meta tags**
    - Use fast-check to generate product data and verify correct OG tag generation including truncation and image omission
    - **Validates: Requirements 7.1, 7.2, 7.7**

  - [ ]* 10.4 Write property tests for locale meta tags (Property 15)
    - **Property 15: Locale meta tags**
    - Use fast-check to verify `og:locale` and `og:locale:alternate` tags are correct for any supported locale
    - **Validates: Requirements 7.4, 7.5**

- [x] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Frontend property tests use `fast-check`; backend property tests use `hypothesis`
- The backend models (Product, ProductTranslation, Cart, CartItem) already exist — no migrations needed
- The `Order` model stores a single `address` string — the structured form concatenates fields before submission
- All locale configuration flows from the single source of truth: `src/lib/i18n.ts`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "1.4", "1.5"] },
    { "id": 3, "tasks": ["2.4", "2.5", "2.6", "3.1", "3.2"] },
    { "id": 4, "tasks": ["3.3", "3.4", "5.1", "6.1", "6.3", "6.4"] },
    { "id": 5, "tasks": ["5.2", "5.3", "6.2", "5.4"] },
    { "id": 6, "tasks": ["6.5", "6.6", "6.7", "6.8", "6.9", "8.1"] },
    { "id": 7, "tasks": ["8.2", "9.1"] },
    { "id": 8, "tasks": ["9.2", "10.1", "10.2"] },
    { "id": 9, "tasks": ["9.3", "9.4", "10.3", "10.4"] }
  ]
}
```
