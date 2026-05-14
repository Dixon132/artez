# Requirements Document

## Introduction

This feature enhances the Artesena e-commerce platform (Next.js 16 + Django 6) with comprehensive SEO optimization and localized URL pathnames. The platform sells Bolivian artisan instruments and already supports three locales (en, es, fr) via next-intl with locale-prefixed routing. This spec covers: dynamic metadata generation for all pages, translated URL pathnames using next-intl's `pathnames` configuration, section-based routing for the home page (about, contact), a cart session visibility bug fix in the admin dashboard, and general SEO infrastructure (sitemap, robots.txt, canonical URLs, hreflang, structured data).

## Glossary

- **Metadata_Generator**: The Next.js `generateMetadata` function that produces page-level title, description, and Open Graph tags at build/request time
- **Routing_Config**: The next-intl `defineRouting` configuration in `src/i18n/routing.ts` that defines locale-aware pathnames
- **Sitemap_Generator**: A Next.js route handler or `sitemap.ts` file that dynamically produces a sitemap.xml including all localized URLs
- **Structured_Data_Renderer**: A component or metadata utility that outputs JSON-LD Schema.org Product markup on product pages
- **Cart_Service**: The Django CartViewSet that manages session-based shopping carts
- **Admin_Dashboard**: The Django admin interface for managing carts, orders, and products
- **Section_Router**: The routing mechanism that maps standalone URLs (/about, /contact) to scrollable sections on the home page while providing independent metadata
- **Canonical_URL_Generator**: A utility that produces canonical link tags and hreflang alternate links for each page across all supported locales

## Requirements

### Requirement 1: Dynamic Metadata for Products List Page

**User Story:** As a search engine crawler, I want the products list page to have descriptive metadata, so that the page ranks well and displays meaningful snippets in search results.

#### Acceptance Criteria

1. WHEN the products list page is rendered, THE Metadata_Generator SHALL produce a title containing the translated page name and the total product count
2. WHEN the products list page is rendered, THE Metadata_Generator SHALL produce a description summarizing the product catalog in the current locale language
3. WHEN the products list page is rendered, THE Metadata_Generator SHALL include Open Graph tags with og:title, og:description, og:url, og:type set to "website", and og:locale in BCP 47 format
4. WHEN the products list page is rendered in a given locale, THE Metadata_Generator SHALL include og:locale:alternate tags for all other supported locales

### Requirement 2: Dynamic Metadata for Cart Page

**User Story:** As a user sharing their cart link, I want the cart page to have dynamic metadata reflecting its content, so that shared links display meaningful previews.

#### Acceptance Criteria

1. WHEN the cart page is rendered, THE Metadata_Generator SHALL produce a title containing the translated cart page name and the current item count
2. WHEN the cart page is rendered with zero items, THE Metadata_Generator SHALL produce a title indicating an empty cart state
3. WHEN the cart page is rendered, THE Metadata_Generator SHALL include og:url with the localized cart path and og:locale in BCP 47 format
4. THE Metadata_Generator SHALL set robots meta to "noindex, nofollow" for the cart page to prevent indexing of user-specific content

### Requirement 3: Dynamic Metadata for Home Page

**User Story:** As a marketing team member, I want the home page to have proper SEO metadata, so that the brand appears correctly in search results and social shares.

#### Acceptance Criteria

1. WHEN the home page is rendered, THE Metadata_Generator SHALL produce a title containing the brand name "Artesena" and a locale-specific tagline
2. WHEN the home page is rendered, THE Metadata_Generator SHALL produce a description summarizing the platform offering in the current locale language
3. WHEN the home page is rendered, THE Metadata_Generator SHALL include Open Graph tags with og:title, og:description, og:image pointing to a brand image, og:url as the root locale path, og:type set to "website", and og:locale in BCP 47 format
4. WHEN the home page is rendered, THE Metadata_Generator SHALL include og:locale:alternate tags for all other supported locales

### Requirement 4: Localized URL Pathnames

**User Story:** As an international user, I want URLs to be in my language, so that I can understand the page purpose from the URL and share readable links.

#### Acceptance Criteria

1. THE Routing_Config SHALL define translated pathnames for the products route: "/products" (en), "/productos" (es), "/produits" (fr)
2. THE Routing_Config SHALL define translated pathnames for the cart route: "/cart" (en), "/carrito" (es), "/panier" (fr)
3. THE Routing_Config SHALL define translated pathnames for the about route: "/about" (en), "/nosotros" (es), "/a-propos" (fr)
4. THE Routing_Config SHALL define translated pathnames for the checkout route: "/checkout" (en), "/pagar" (es), "/paiement" (fr)
5. THE Routing_Config SHALL define translated pathnames for the contact route: "/contact" (en), "/contacto" (es), "/contact" (fr)
6. WHEN a user navigates to a localized pathname, THE Routing_Config SHALL resolve the request to the correct page component regardless of the locale-specific path segment
7. WHEN a user switches locale, THE Routing_Config SHALL translate the current pathname to the equivalent path in the target locale
8. THE Routing_Config SHALL preserve dynamic segments (product IDs) across locale switches, producing paths like "/es/productos/1" and "/fr/produits/1"

### Requirement 5: Section-Based Home Page Routing

**User Story:** As a site visitor, I want to access About and Contact sections via direct URLs that scroll to the relevant section on the home page, so that I can bookmark or share specific sections.

#### Acceptance Criteria

1. WHEN a user navigates to the about URL directly, THE Section_Router SHALL render the home page content and scroll to the About section
2. WHEN a user navigates to the contact URL directly, THE Section_Router SHALL render the home page content and scroll to the Contact section
3. WHEN the about URL is accessed, THE Metadata_Generator SHALL produce metadata specific to the About section (title, description, OG tags) distinct from the home page metadata
4. WHEN the contact URL is accessed, THE Metadata_Generator SHALL produce metadata specific to the Contact section (title, description, OG tags) distinct from the home page metadata
5. WHEN a search engine crawls the about or contact URLs, THE Section_Router SHALL serve a full HTML response with the section content visible without JavaScript-dependent scrolling
6. THE Section_Router SHALL maintain the about and contact sections as visible parts of the home page scrollable view when accessed from the home URL

### Requirement 6: Cart Session Admin Visibility

**User Story:** As an admin, I want to see all active carts with their session IDs and items in the admin dashboard, so that I can monitor shopping activity and debug cart issues.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL display all Cart records with columns: id, session_id, item count, total value, and created_at timestamp
2. THE Admin_Dashboard SHALL allow filtering carts by creation date and searching by session_id
3. WHEN a cart record is viewed in detail, THE Admin_Dashboard SHALL display all associated CartItem records with product name, quantity, and selected options
4. THE Cart_Service SHALL create a Cart record in the database upon the first add-item request for a given session_id
5. IF a cart add-item request contains a session_id that does not match the expected format, THEN THE Cart_Service SHALL reject the request with a 400 status code and descriptive error message
6. THE Admin_Dashboard SHALL display the total number of active carts (carts with at least one item) in the cart list view header

### Requirement 7: Dynamic Sitemap Generation

**User Story:** As a search engine crawler, I want a comprehensive sitemap covering all pages and locales, so that all content is discoverable and indexable.

#### Acceptance Criteria

1. THE Sitemap_Generator SHALL produce a valid XML sitemap at the /sitemap.xml path
2. THE Sitemap_Generator SHALL include entries for all static pages (home, products list, about, contact) in each supported locale with their localized pathnames
3. THE Sitemap_Generator SHALL include entries for each individual product page in each supported locale with localized pathnames
4. WHEN a new product is added to the database, THE Sitemap_Generator SHALL include the new product in subsequent sitemap responses without requiring a rebuild
5. THE Sitemap_Generator SHALL include xhtml:link hreflang alternate references for each URL pointing to the equivalent page in all other supported locales
6. THE Sitemap_Generator SHALL set lastmod for product pages based on the product's last modification timestamp

### Requirement 8: Robots.txt Configuration

**User Story:** As an SEO manager, I want a properly configured robots.txt, so that search engines can efficiently crawl the site while respecting access boundaries.

#### Acceptance Criteria

1. THE Metadata_Generator SHALL serve a robots.txt file at the /robots.txt path
2. THE robots.txt SHALL allow all user agents to crawl all public pages
3. THE robots.txt SHALL disallow crawling of /api/, /admin/, and /media/ paths
4. THE robots.txt SHALL reference the sitemap URL as an absolute URL

### Requirement 9: Canonical URLs and Hreflang Alternates

**User Story:** As an SEO specialist, I want each page to declare its canonical URL and hreflang alternates, so that search engines understand the relationship between localized versions and avoid duplicate content penalties.

#### Acceptance Criteria

1. THE Canonical_URL_Generator SHALL include a canonical link tag on every page pointing to the current page's absolute URL with the correct locale prefix and localized pathname
2. THE Canonical_URL_Generator SHALL include hreflang link tags for all supported locales pointing to the equivalent page in each locale with localized pathnames
3. THE Canonical_URL_Generator SHALL include an x-default hreflang link pointing to the English (default locale) version of the page
4. WHEN a page has query parameters, THE Canonical_URL_Generator SHALL produce a canonical URL without query parameters

### Requirement 10: Structured Data for Products (JSON-LD)

**User Story:** As a search engine crawler, I want product pages to include Schema.org structured data, so that rich snippets (price, availability, images) appear in search results.

#### Acceptance Criteria

1. WHEN a product detail page is rendered, THE Structured_Data_Renderer SHALL output a JSON-LD script tag with @type "Product"
2. THE Structured_Data_Renderer SHALL include the product name, description, and brand ("Artesena") in the structured data
3. THE Structured_Data_Renderer SHALL include an "offers" object with @type "Offer", price as the base_price, priceCurrency as "USD", and availability as "https://schema.org/InStock"
4. WHEN the product has images, THE Structured_Data_Renderer SHALL include an "image" array with all product image URLs
5. IF the product has no images, THEN THE Structured_Data_Renderer SHALL omit the "image" field from the structured data
6. THE Structured_Data_Renderer SHALL produce valid JSON-LD that passes the Schema.org Product validator without errors

### Requirement 11: Product Detail Page Metadata Completeness

**User Story:** As a developer, I want to verify the existing product detail page metadata is complete, so that no SEO signals are missing.

#### Acceptance Criteria

1. WHEN a product detail page is rendered, THE Metadata_Generator SHALL include a canonical URL pointing to the absolute URL of the product page in the current locale with the localized pathname
2. WHEN a product detail page is rendered, THE Metadata_Generator SHALL include hreflang alternate links for all supported locales
3. WHEN a product detail page is rendered, THE Metadata_Generator SHALL include twitter:card set to "summary_large_image" for enhanced social sharing
4. IF the product is not found, THEN THE Metadata_Generator SHALL return a "Product not found" title and set robots to "noindex"

### Requirement 12: Image Optimization and Performance

**User Story:** As a site visitor, I want images to load efficiently, so that pages render quickly and provide a smooth browsing experience.

#### Acceptance Criteria

1. THE Metadata_Generator SHALL use Next.js Image component with proper width, height, and alt attributes for all product images on list and detail pages
2. WHEN product images are rendered below the viewport fold, THE Metadata_Generator SHALL apply lazy loading via the loading="lazy" attribute
3. THE Metadata_Generator SHALL serve images in modern formats (WebP) when the browser supports them via Next.js automatic optimization
4. WHEN Open Graph images are specified, THE Metadata_Generator SHALL provide absolute URLs that are publicly accessible to social media crawlers
