# Requirements Document

## Introduction

This feature covers four improvement areas for the Artesena e-commerce platform (Bolivian artisan instruments): implementing a fully functional internationalization (i18n) system with `next-intl`, fixing session-based cart logic in the backend, enhancing Meta Pixel commerce compatibility with structured product data, and improving the checkout address form UX. The default language changes from Spanish to English, and the system must be scalable to support additional languages beyond the initial three (en, es, fr).

## Glossary

- **Frontend**: The Next.js 16 application using App Router, React 19, Tailwind 4, and TypeScript
- **Backend**: The Django 6 + Django REST Framework API connected to PostgreSQL (artesena_db)
- **i18n_System**: The internationalization framework (next-intl) responsible for translating all UI text and routing locale-prefixed URLs
- **Translation_Files**: JSON files containing key-value pairs of translated UI strings for each supported locale
- **Locale**: A language identifier (e.g., "en", "es", "fr") used in URL prefixes and translation lookups
- **Default_Locale**: The primary language ("en") used when no locale is specified or detected
- **Cart_Service**: The backend ViewSet that manages session-based shopping carts via session_id
- **Session_ID**: A unique identifier stored in localStorage that links a browser session to a cart in the database
- **Meta_Pixel**: Facebook's tracking pixel that fires commerce events (PageView, ViewContent, AddToCart, InitiateCheckout, Purchase)
- **Product_Catalog_Meta**: Structured product metadata (Open Graph tags) that enables Meta Commerce features like dynamic ads and product tagging
- **Checkout_Form**: The form on the checkout page where customers enter email, name, and shipping address
- **Product_Translation_API**: The backend endpoint that returns translated product data via `?lang=` query parameter

## Requirements

### Requirement 1: i18n Translation Framework Integration

**User Story:** As a developer, I want to integrate next-intl as the translation framework, so that all UI text can be translated and managed through structured JSON files.

#### Acceptance Criteria

1. WHEN the Frontend is built, THE i18n_System SHALL load Translation_Files from the `src/messages/{locale}.json` path, where `{locale}` is one of the configured locales (en, es, fr)
2. THE i18n_System SHALL provide a `useTranslations` hook that components use to retrieve translated strings by dot-notation namespace keys (e.g., `navbar.home`, `products.title`) corresponding to the nested JSON structure in Translation_Files
3. WHEN a Translation_File is missing a key, THE i18n_System SHALL fall back to the Default_Locale ("en") translation for that key
4. IF a translation key is missing from both the requested locale and the Default_Locale Translation_File, THEN THE i18n_System SHALL render the translation key itself as visible text
5. THE Translation_Files SHALL organize all UI strings into namespaced sections corresponding to each page and shared component: home, products, cart, checkout, about, and navbar
6. WHEN a new Locale is added, THE i18n_System SHALL require only a new `{locale}.json` file in the `src/messages/` directory and an entry in the locales configuration array defined in `src/lib/i18n.ts`
7. THE Translation_Files for each locale SHALL contain identical key structures, ensuring every key present in the Default_Locale file exists in all other locale files

### Requirement 2: Locale Routing and Redirection

**User Story:** As a visitor, I want to be automatically redirected to the correct locale-prefixed URL, so that I always see content in my preferred language.

#### Acceptance Criteria

1. WHEN a visitor accesses a URL without a Locale prefix, THE Frontend SHALL issue a temporary redirect (HTTP 307) to the same path prefixed with the Default_Locale ("en"), preserving any query parameters and hash fragments from the original URL
2. THE Frontend SHALL define the supported Locale list as ["en", "es", "fr"] and set the Default_Locale to "en" in all configuration sources (middleware.ts, i18n.ts)
3. WHEN a visitor navigates between pages, THE Frontend SHALL preserve the current Locale prefix in all internal links, including anchor elements and programmatic navigation (router.push)
4. WHEN a visitor switches Locale via the navbar language selector, THE Frontend SHALL navigate to the same page path with the new Locale prefix within 1 second, preserving any query parameters present in the current URL
5. WHILE a visitor is on a locale-prefixed route, THE Frontend SHALL pass the current Locale to all API calls as the `lang` query parameter
6. IF a visitor accesses a URL with a Locale prefix that is not in the supported Locale list, THEN THE Frontend SHALL issue a temporary redirect (HTTP 307) to the Default_Locale ("en") version of that path, preserving any query parameters and hash fragments
7. WHEN the middleware evaluates a request path, THE Frontend SHALL exclude paths matching `_next/`, `favicon.ico`, `admin`, `media/`, and `static/` from locale redirection processing

### Requirement 3: Product Content Translation Display

**User Story:** As a visitor browsing in a non-default language, I want to see product names, descriptions, categories, and options in my selected language, so that I can understand the products being offered.

#### Acceptance Criteria

1. WHEN the products list page loads, THE Frontend SHALL request products from the Product_Translation_API with the current Locale (one of "en", "es", or "fr") as the `lang` query parameter
2. WHEN a product detail page loads, THE Frontend SHALL request product data from the Product_Translation_API with the current Locale as the `lang` query parameter and display the translated product name and description returned in the response
3. IF the Product_Translation_API has no translation record for the requested Locale, THEN THE Backend SHALL return the base product data in the default language (Spanish) as fallback, using the same response structure as a translated response
4. WHEN any page displaying product content loads, THE Frontend SHALL pass the current Locale as the `lang` query parameter to all product-related API calls, including products, categories, options, and option values endpoints
5. WHEN a visitor switches Locale on a product page, THE Frontend SHALL re-fetch product data with the new Locale as the `lang` parameter and update the displayed product name, description, category name, option names, and option value names without a full page reload, within 2 seconds of the locale change
6. IF the Product_Translation_API request fails due to a network error or server error, THEN THE Frontend SHALL display the last successfully loaded product content or, if no prior content exists, display an error message indicating that product information could not be loaded

### Requirement 4: Session-Based Cart Consistency

**User Story:** As a visitor, I want my cart to persist across page navigations and locale switches, so that I do not lose my selected items.

#### Acceptance Criteria

1. THE Cart_Service SHALL retrieve cart items exclusively by the Session_ID provided in the request, where Session_ID is a string of at most 255 characters matching the pattern `session_{timestamp}_{alphanumeric}`
2. WHEN a visitor adds an item to the cart, THE Cart_Service SHALL associate the item with the Session_ID from the request body and store the specified quantity (between 1 and 99 inclusive)
3. WHEN a visitor switches Locale, THE Frontend SHALL preserve the same Session_ID stored in localStorage and display the same cart items with identical quantities and selected options
4. IF a Cart with the given Session_ID does not exist, THEN THE Cart_Service SHALL create a new empty Cart associated with that Session_ID and return it with an empty items list and a total of 0
5. IF a visitor updates item quantity to a value less than 1 or greater than 99, THEN THE Cart_Service SHALL reject the request with an error response indicating the quantity is invalid and preserve the existing item quantity unchanged
6. WHEN the `lang` query parameter is provided in a cart retrieval request, THE Cart_Service SHALL return product names and option names in the language specified by `lang`
7. IF the `lang` query parameter specifies a language for which no translation exists, THEN THE Cart_Service SHALL fall back to the default product name stored in the Product model

### Requirement 5: Cart UI Translation

**User Story:** As a visitor, I want the cart page UI (buttons, labels, messages) to appear in my selected language, so that I can navigate the purchase flow comfortably.

#### Acceptance Criteria

1. WHEN the cart page loads, THE Frontend SHALL display all static UI text (page title, empty state heading, empty state description, button labels, summary section labels) using translation keys resolved against the current Locale (en, es, or fr)
2. WHEN the cart is empty, THE Frontend SHALL display a translated empty state heading, a translated description message, and a "View products" button with text resolved from the current Locale's translation keys
3. WHEN the cart contains items, THE Frontend SHALL display translated text for the "Remove" button label, the "Summary" heading, the "Subtotal" label, the "Total" label, and the "Proceed to Checkout" button label, each resolved from the current Locale's translation keys
4. WHEN the visitor triggers the remove-item confirmation, THE Frontend SHALL display the confirmation prompt text resolved from the current Locale's translation keys
5. IF a translation key has no value defined for the current Locale, THEN THE Frontend SHALL fall back to the default Locale (en) value for that key

### Requirement 6: Checkout Form Address Improvements

**User Story:** As a customer, I want clear guidance on how to fill in my shipping address, so that my order arrives correctly.

#### Acceptance Criteria

1. THE Checkout_Form SHALL display separate input fields for: street address (max 200 characters), city (max 100 characters), state/department (max 100 characters), country (selectable from a predefined list of supported shipping destinations), and postal code (max 20 characters)
2. THE Checkout_Form SHALL display translated labels and placeholder text for each address field based on the current Locale (en, es, or fr)
3. THE Checkout_Form SHALL display a helper text below the address section, translated to the current Locale, indicating that the customer should provide a complete street address including building number and any apartment or floor reference for international delivery from Bolivia
4. WHEN the customer submits the form, THE Frontend SHALL concatenate the structured address fields into a single address string in the order: street address, city, state/department, postal code, country, separated by commas, before sending to the Backend
5. THE Checkout_Form SHALL mark street address, city, and country fields as required
6. IF the customer submits the form with any required address field (street address, city, or country) empty, THEN THE Checkout_Form SHALL prevent submission and display an inline validation message below each empty required field indicating that the field is required
7. THE Checkout_Form SHALL display all form labels, buttons, and informational text in the current Locale

### Requirement 7: Meta Pixel Commerce Enhancement

**User Story:** As the store owner, I want my products to be compatible with Meta Commerce features (dynamic ads, product catalog), so that I can run targeted advertising campaigns on Facebook and Instagram.

#### Acceptance Criteria

1. THE Frontend SHALL render Open Graph meta tags (og:title, og:description, og:image, og:url, og:type) on every product detail page, where og:title maps to the product name (maximum 95 characters, truncated with ellipsis if exceeded), og:description maps to the product description (maximum 200 characters, truncated with ellipsis if exceeded), og:image maps to the first image URL from the product's images array, og:url maps to the canonical product URL in the format /[locale]/products/[id], and og:type is set to "og:product"
2. THE Frontend SHALL render product-specific meta tags (product:price:amount, product:price:currency, product:availability) on product detail pages, where product:price:amount maps to the product base_price, product:price:currency is set to "USD", and product:availability is set to "in stock"
3. WHEN a product page loads, THE Meta_Pixel SHALL fire a ViewContent event with content_ids set to an array containing the product id, content_name set to the product name, content_type set to "product", value set to the product base_price as a number, and currency set to "USD"
4. THE Frontend SHALL include a `<meta property="og:locale">` tag on all pages, with the value set to the BCP 47 locale format corresponding to the current locale parameter (en → "en_US", es → "es_ES", fr → "fr_FR")
5. THE Frontend SHALL include `og:locale:alternate` meta tags for all other supported locales (en, es, fr) excluding the current locale, each with the corresponding BCP 47 locale format value
6. WHEN Meta's crawler requests a product URL at /[locale]/products/[id], THE Frontend SHALL return server-rendered HTML containing valid Open Graph meta tags without requiring client-side JavaScript execution
7. IF a product has no images in its images array, THEN THE Frontend SHALL omit the og:image meta tag rather than rendering an empty or broken image URL

### Requirement 8: Scalable Locale Configuration

**User Story:** As a developer, I want the locale system to be easily extensible, so that adding a new language requires minimal code changes.

#### Acceptance Criteria

1. THE i18n_System SHALL define all supported Locales and the default Locale in a single configuration file (src/lib/i18n.ts) that is imported by middleware, routing, and the navbar component as the sole source of truth for locale values
2. WHEN a new Locale is added to the configuration array, THE Frontend SHALL automatically include it in the navbar language selector without requiring changes to the navbar component code
3. WHEN a new Locale is added to the configuration array, THE Frontend middleware SHALL automatically recognize and route URLs with that Locale prefix without requiring changes to the middleware code
4. THE i18n_System SHALL support adding a new Locale by performing only these steps: (a) adding the BCP 47 locale code to the configuration array, (b) creating a Translation_File for that locale, and (c) adding product translations via the Backend admin — no other code changes shall be required
5. THE Translation_Files SHALL use a key structure with a maximum nesting depth of 2 levels (e.g., "section.key") to allow developers to locate and add translation entries without navigating deeply nested hierarchies
6. THE i18n_System SHALL support non-Latin scripts (e.g., Chinese, Arabic) without requiring code changes beyond adding the locale to the configuration array and creating the corresponding Translation_File
7. IF a Locale is present in the configuration array but its corresponding Translation_File does not exist, THEN THE i18n_System SHALL fall back to the default Locale translations and log a warning during development
