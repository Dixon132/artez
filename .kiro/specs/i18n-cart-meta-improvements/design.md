# Design Document: i18n, Cart, Meta & Checkout Improvements

## Overview

This design covers four interconnected improvement areas for the Artesena e-commerce platform:

1. **i18n Framework Integration** — Integrate `next-intl` into the Next.js 16 App Router to provide structured translation loading, locale-aware routing, and a scalable multi-language architecture with English as the new default locale.
2. **Session-Based Cart Consistency** — Ensure the Django backend cart service correctly isolates carts by `session_id`, supports translated product names in responses, and maintains cart state across locale switches.
3. **Meta Pixel Commerce Enhancement** — Add Open Graph meta tags and structured product metadata to product pages for Meta Commerce compatibility (dynamic ads, product catalog, product tagging).
4. **Checkout Form Address Improvements** — Replace the single textarea address field with structured inputs (street, city, state, country, postal code) with translated labels and validation.

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| i18n library | `next-intl` | First-class App Router support, server component compatibility, built-in middleware for locale routing |
| Default locale | `en` (changed from `es`) | International audience targeting, English as primary commerce language |
| Translation file format | Flat 2-level JSON (`section.key`) | Simple to maintain, easy to locate keys, avoids deep nesting |
| Cart session persistence | `localStorage` session_id | No auth required, persists across locale switches, already implemented |
| OG tags rendering | Server-side via `generateMetadata` | Meta crawler requires server-rendered HTML, no JS execution |
| Address form | Structured fields concatenated on submit | Better UX, validation per field, single `address` string to backend (no model changes) |

## Architecture

```mermaid
graph TB
    subgraph "Frontend (Next.js 16 + App Router)"
        MW[middleware.ts] --> |locale detection/redirect| LR[Locale Router]
        LR --> |[locale] param| Pages[Page Components]
        
        subgraph "i18n Layer"
            CFG[src/lib/i18n.ts<br/>Single Source of Truth] --> MW
            CFG --> NAV[Navbar Language Selector]
            MSG[src/messages/*.json] --> |loaded by| INTL[next-intl Provider]
            INTL --> |useTranslations hook| Pages
        end
        
        subgraph "Meta/SEO Layer"
            GM[generateMetadata] --> |OG tags| HTML[Server-Rendered HTML]
            FBP[fbpixel.ts] --> |ViewContent, AddToCart| META[Meta Pixel Events]
        end
        
        subgraph "Cart/Checkout Layer"
            CART_UI[Cart Page] --> |session_id + lang| API_CALL[API Service]
            CHECKOUT[Checkout Form] --> |structured address| API_CALL
        end
    end
    
    subgraph "Backend (Django 6 + DRF)"
        subgraph "Product API"
            PV[ProductViewSet] --> |?lang=xx| TRANS[Translation Lookup]
            TRANS --> PT[ProductTranslation]
            TRANS --> |fallback| PROD[Product base data]
        end
        
        subgraph "Cart API"
            CV[CartViewSet] --> |session_id| CART_DB[(Cart + CartItem)]
            CV --> |?lang=xx| TRANS
        end
    end
    
    Pages --> |fetch with lang param| PV
    API_CALL --> |session_id| CV
```

## Components and Interfaces

### 1. i18n Configuration (`src/lib/i18n.ts`)

The single source of truth for all locale configuration. All other modules import from here.

```typescript
// src/lib/i18n.ts
export const locales = ["en", "es", "fr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

// BCP 47 mapping for OG tags
export const localeToBcp47: Record<Locale, string> = {
  en: "en_US",
  es: "es_ES",
  fr: "fr_FR",
};

// next-intl request config
export async function getMessages(locale: string) {
  try {
    return (await import(`@/messages/${locale}.json`)).default;
  } catch {
    console.warn(`Translation file for "${locale}" not found, falling back to "${defaultLocale}"`);
    return (await import(`@/messages/${defaultLocale}.json`)).default;
  }
}
```

### 2. Middleware (`middleware.ts`)

Handles locale detection, redirection, and path exclusion.

```typescript
// middleware.ts
import { locales, defaultLocale } from "@/lib/i18n";
import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export const config = {
  matcher: ["/((?!_next/|favicon.ico|admin|media/|static/).*)"],
};
```

### 3. Translation Files (`src/messages/{locale}.json`)

Two-level nested JSON structure with namespaced sections.

```typescript
// Type definition for translation file structure
interface TranslationFile {
  navbar: Record<string, string>;
  home: Record<string, string>;
  products: Record<string, string>;
  cart: Record<string, string>;
  checkout: Record<string, string>;
  about: Record<string, string>;
  common: Record<string, string>;
}
```

### 4. Locale Layout Provider (`src/app/[locale]/layout.tsx`)

Wraps all locale pages with the `next-intl` provider and generates locale-aware metadata.

```typescript
interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}
```

### 5. Cart API Service (Enhanced)

```typescript
// Updated cart API with lang support
export const cartApi = {
  get: async (sessionId: string, lang?: string) => {
    const params = lang ? `?lang=${lang}` : "";
    const res = await fetch(`${API_URL}/cart/${sessionId}/${params}`);
    return res.json();
  },
  // ... other methods unchanged
};
```

### 6. Backend Cart ViewSet (Enhanced)

```python
# Enhanced retrieve method with lang support
def retrieve(self, request, pk=None):
    lang = request.query_params.get('lang', None)
    cart = Cart.objects.get(session_id=pk)
    serializer = CartSerializer(cart, context={'request': request, 'lang': lang})
    return Response(serializer.data)
```

### 7. Checkout Address Form Component

```typescript
interface AddressFormData {
  street: string;      // max 200 chars, required
  city: string;        // max 100 chars, required
  state: string;       // max 100 chars, optional
  country: string;     // required, from predefined list
  postalCode: string;  // max 20 chars, optional
}

// Concatenation function
function formatAddress(data: AddressFormData): string {
  return [data.street, data.city, data.state, data.postalCode, data.country]
    .filter(Boolean)
    .join(", ");
}
```

### 8. Product Page Metadata Generator

```typescript
// generateMetadata for product detail pages
interface ProductMetadata {
  ogTitle: string;        // max 95 chars, truncated with "..."
  ogDescription: string;  // max 200 chars, truncated with "..."
  ogImage?: string;       // first image URL, omitted if no images
  ogUrl: string;          // /[locale]/products/[id]
  ogType: "og:product";
  ogLocale: string;       // BCP 47 format
  ogLocaleAlternates: string[];  // other locales in BCP 47
  productPrice: number;
  productCurrency: "USD";
  productAvailability: "in stock";
}
```

## Data Models

### Existing Models (No Changes Required)

The backend models already support the translation system:

- `Product` — base product with `name`, `description`, `base_price`
- `ProductTranslation` — per-locale translations (`product`, `language`, `name`, `description`)
- `CategoryTranslation` — per-locale category names
- `OptionTranslation` / `OptionValueTranslation` — per-locale option names
- `Cart` / `CartItem` / `CartItemOption` — session-based cart (keyed by `session_id`)
- `Order` — stores concatenated `address` string (no schema change needed)

### Translation File Schema

```json
{
  "navbar": {
    "home": "Home",
    "products": "Products",
    "cart": "Cart",
    "about": "About",
    "language": "Language"
  },
  "home": {
    "title": "Artisan Instruments from Bolivia",
    "subtitle": "Handcrafted with tradition"
  },
  "products": {
    "title": "Our Instruments",
    "category": "Category",
    "addToCart": "Add to Cart",
    "viewDetails": "View Details"
  },
  "cart": {
    "title": "Shopping Cart",
    "empty": "Your cart is empty",
    "emptyDescription": "Add products to start your purchase",
    "viewProducts": "View Products",
    "remove": "Remove",
    "removeConfirm": "Remove this product from cart?",
    "summary": "Summary",
    "subtotal": "Subtotal",
    "total": "Total",
    "checkout": "Proceed to Checkout"
  },
  "checkout": {
    "title": "Complete Purchase",
    "backToCart": "Back to cart",
    "contactInfo": "Contact Information",
    "email": "Email",
    "fullName": "Full Name",
    "shippingAddress": "Shipping Address",
    "street": "Street Address",
    "streetPlaceholder": "Street name, building number, apt/floor",
    "city": "City",
    "state": "State / Department",
    "country": "Country",
    "postalCode": "Postal Code",
    "addressHelper": "Please provide a complete street address including building number and any apartment or floor reference for international delivery from Bolivia.",
    "required": "This field is required",
    "confirmOrder": "Confirm Order",
    "processing": "Processing..."
  },
  "about": {
    "title": "About Us",
    "description": "Traditional Bolivian instrument craftsmanship"
  },
  "common": {
    "loading": "Loading...",
    "error": "An error occurred",
    "retry": "Try again"
  }
}
```

### Supported Countries List (Checkout)

```typescript
export const shippingCountries = [
  "United States", "Canada", "United Kingdom", "Germany", "France",
  "Spain", "Italy", "Netherlands", "Belgium", "Switzerland",
  "Australia", "Japan", "Brazil", "Argentina", "Chile",
  "Colombia", "Peru", "Mexico", "Bolivia"
] as const;
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Translation resolution with fallback

*For any* valid dot-notation key and any supported locale, if the key exists in that locale's translation file the system shall return that value; if the key is missing from the requested locale but exists in the default locale, the system shall return the default locale value; if the key is missing from both, the system shall return the key string itself.

**Validates: Requirements 1.2, 1.3, 1.4**

### Property 2: Translation file structural consistency

*For any* key present in the default locale translation file, that same key shall exist in every other supported locale's translation file.

**Validates: Requirements 1.7**

### Property 3: Middleware locale redirect

*For any* URL path that either has no locale prefix or has a locale prefix not in the supported locales list, the middleware shall issue a temporary redirect (HTTP 307) to the same path prefixed with the default locale ("en"), preserving all query parameters and hash fragments.

**Validates: Requirements 2.1, 2.6**

### Property 4: Locale preservation in navigation

*For any* page path and any current locale, all internal links generated by the application shall contain the current locale prefix, and switching to a different locale shall produce the same path with only the locale prefix changed, preserving query parameters.

**Validates: Requirements 2.3, 2.4**

### Property 5: API calls include locale parameter

*For any* locale-prefixed route and any product-related API call made from that route, the `lang` query parameter shall equal the current route's locale value.

**Validates: Requirements 2.5**

### Property 6: Middleware path exclusion

*For any* request path matching the patterns `_next/`, `favicon.ico`, `admin`, `media/`, or `static/`, the middleware shall not perform locale redirection and shall pass the request through unchanged.

**Validates: Requirements 2.7**

### Property 7: Backend product translation fallback

*For any* product and any requested locale, if a translation record exists for that locale the API shall return the translated name and description; if no translation exists, the API shall return the base product name and description in the same response structure.

**Validates: Requirements 3.3**

### Property 8: Cart session isolation and creation

*For any* two distinct valid session_id strings, items added to one cart shall never appear when retrieving the other cart. *For any* valid session_id that does not yet exist in the database, retrieving the cart shall return a new empty cart with zero items and a total of 0.

**Validates: Requirements 4.1, 4.4**

### Property 9: Cart add item correctness

*For any* valid session_id, valid product_id, and quantity between 1 and 99 inclusive, adding an item to the cart shall result in that item being retrievable from the cart with the specified quantity and product association.

**Validates: Requirements 4.2**

### Property 10: Cart quantity validation

*For any* cart item update where the new quantity is less than 1 or greater than 99, the Cart_Service shall reject the request and the item's quantity shall remain unchanged from its previous value.

**Validates: Requirements 4.5**

### Property 11: Cart translation with fallback

*For any* cart containing items and any supported locale passed as the `lang` parameter, the cart retrieval response shall return product names matching the translation for that locale; if no translation exists for a product in the requested locale, the response shall return the base product name.

**Validates: Requirements 4.6, 4.7**

### Property 12: Address field concatenation

*For any* set of address field values (street, city, state, postalCode, country), the concatenation function shall produce a string containing all non-empty fields separated by commas in the order: street, city, state, postalCode, country.

**Validates: Requirements 6.4**

### Property 13: Checkout required field validation

*For any* subset of required fields (street address, city, country) that are left empty at form submission time, the form shall prevent submission and display an inline validation message for each empty required field.

**Validates: Requirements 6.6**

### Property 14: Product page OG meta tags

*For any* product with a name, description, base_price, and at least one image, the server-rendered product page shall contain: `og:title` with the product name (truncated to 95 characters with ellipsis if exceeded), `og:description` with the product description (truncated to 200 characters with ellipsis if exceeded), `og:image` with the first image URL, `og:url` as `/[locale]/products/[id]`, `og:type` as `"og:product"`, `product:price:amount` as the base_price, `product:price:currency` as `"USD"`, and `product:availability` as `"in stock"`. If the product has no images, `og:image` shall be omitted.

**Validates: Requirements 7.1, 7.2, 7.7**

### Property 15: Locale meta tags

*For any* supported locale as the current page locale, the page shall include an `og:locale` meta tag with the BCP 47 value for that locale (en→en_US, es→es_ES, fr→fr_FR), and `og:locale:alternate` meta tags for all other supported locales with their respective BCP 47 values.

**Validates: Requirements 7.4, 7.5**

### Property 16: Dynamic locale configuration

*For any* locale string present in the configuration array in `src/lib/i18n.ts`, the navbar language selector shall render a selectable option for that locale, and the middleware shall allow URLs with that locale prefix through without redirecting.

**Validates: Requirements 8.2, 8.3**

### Property 17: Translation file max nesting depth

*For any* key path in any translation file, the nesting depth shall not exceed 2 levels (i.e., `section.key` format only).

**Validates: Requirements 8.5**

## Error Handling

| Scenario | Handling Strategy |
|----------|-------------------|
| Translation file missing for locale | Fall back to default locale (`en`), log warning in development |
| Translation key missing in locale | Fall back to default locale value; if also missing, render key string |
| Product translation API failure (network/server) | Display last successfully loaded content; if none, show translated error message with retry option |
| Cart API failure | Show error toast, preserve local state, allow retry |
| Invalid session_id format | Backend rejects with 400, frontend generates new valid session_id |
| Quantity out of range (< 1 or > 99) | Backend rejects with 400 error, frontend preserves existing quantity |
| Unsupported locale in URL | Middleware redirects to default locale version (307) |
| Missing OG image (product has no images) | Omit `og:image` tag entirely (no broken URL) |
| Checkout form validation failure | Prevent submission, show inline error per invalid field |
| Country not in supported list | Country field is a select dropdown — only valid options available |

## Testing Strategy

### Property-Based Testing

This feature is suitable for property-based testing because it contains multiple pure functions and universal behaviors that vary meaningfully with input (translation resolution, address concatenation, meta tag generation, cart operations, middleware routing).

**Library**: [fast-check](https://github.com/dubzzz/fast-check) for TypeScript/JavaScript property tests  
**Configuration**: Minimum 100 iterations per property test  
**Tag format**: `Feature: i18n-cart-meta-improvements, Property {number}: {title}`

**Properties to implement as PBT:**
- Property 1: Translation resolution with fallback
- Property 2: Translation file structural consistency
- Property 3: Middleware locale redirect
- Property 6: Middleware path exclusion
- Property 7: Backend product translation fallback (Python: hypothesis)
- Property 8: Cart session isolation and creation (Python: hypothesis)
- Property 9: Cart add item correctness (Python: hypothesis)
- Property 10: Cart quantity validation (Python: hypothesis)
- Property 11: Cart translation with fallback (Python: hypothesis)
- Property 12: Address field concatenation
- Property 14: Product page OG meta tags
- Property 15: Locale meta tags
- Property 17: Translation file max nesting depth

**Backend PBT Library**: [hypothesis](https://hypothesis.readthedocs.io/) for Python/Django property tests

### Unit Tests (Example-Based)

- Locale switch preserves session_id (Requirement 4.3)
- Cart page renders translated empty state (Requirement 5.2)
- Cart page renders translated labels with items (Requirement 5.3)
- Checkout form renders all structured address fields (Requirement 6.1)
- Checkout form displays translated labels per locale (Requirement 6.2)
- Meta Pixel ViewContent event fires with correct data (Requirement 7.3)
- Product list page passes lang param (Requirement 3.1)
- Product detail page passes lang param (Requirement 3.2)

### Integration Tests

- Server-rendered product page contains valid OG tags (Requirement 7.6)
- Non-Latin script translation file loads correctly (Requirement 8.6)
- Full locale switch flow: URL changes, content re-fetches, cart persists
- End-to-end checkout with structured address submission

### Smoke Tests

- Translation files load for all configured locales (Requirement 1.1)
- Config file defines correct locales and default (Requirement 2.2)
- All locale files have expected top-level sections (Requirement 1.5)
