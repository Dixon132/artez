import { Link } from "@/lib/navigation";
import type { Pathnames } from "@/i18n/routing";

interface BreadcrumbItem {
    name: string;
    href: string;
    /** The routing pathname key for next-intl Link (e.g., "/" or "/products") */
    pathKey?: string;
    /** Route params for dynamic routes (e.g., { id: "1" }) */
    params?: Record<string, string>;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

/**
 * Server component that renders a semantic breadcrumb navigation.
 * Uses an ordered list inside a <nav> element with aria-label for accessibility.
 * Links use the next-intl Link component for automatic locale-aware routing.
 *
 * Validates: Requirements 4.4, 14.3, 14.2, 14.4
 */
export default function Breadcrumb({ items }: BreadcrumbProps) {
    return (
        <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-gray-600">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <li key={item.href} className="flex items-center gap-2">
                            {index > 0 && (
                                <span aria-hidden="true">/</span>
                            )}
                            {isLast ? (
                                <span aria-current="page" className="text-gray-900 font-medium">
                                    {item.name}
                                </span>
                            ) : (
                                <Link
                                    href={
                                        item.params
                                            ? { pathname: (item.pathKey || item.href) as Pathnames, params: item.params } as any
                                            : (item.pathKey || item.href) as Pathnames
                                    }
                                    className="hover:text-gray-900 hover:underline"
                                >
                                    {item.name}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
