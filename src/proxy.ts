// Proxy — runs before every route to handle locale detection and redirection
// In Next.js 16, "proxy.ts" replaces the deprecated "middleware.ts"
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Supported locales — English and Burmese
const LOCALES = ["en", "my"];
const DEFAULT_LOCALE = "en";

// Detect preferred locale from Accept-Language header
// Falls back to English if Burmese isn't preferred
function getPreferredLocale(request: NextRequest): string {
  // Check Accept-Language header for Burmese preference
  const acceptLang = request.headers.get("accept-language") || "";

  // Simple check — look for "my" (Burmese) in the header
  // If found before "en", use Burmese; otherwise default to English
  if (acceptLang.includes("my")) {
    return "my";
  }

  return DEFAULT_LOCALE;
}

// Main proxy function — intercepts requests before they reach routes
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the URL already has a supported locale prefix
  // e.g. /en/products or /my/products
  const hasLocalePrefix = LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // If locale prefix exists, pass through and set x-locale header
  // so the root layout can read the current locale
  if (hasLocalePrefix) {
    const locale = pathname.split("/")[1];
    const response = NextResponse.next();
    response.headers.set("x-locale", locale);
    return response;
  }

  // No locale prefix — redirect to the preferred locale
  // e.g. /products → /en/products
  const locale = getPreferredLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

// Only run proxy on page routes — skip static files and API routes
export const config = {
  matcher: [
    // Match all routes EXCEPT:
    // - _next/static (static files like CSS/JS)
    // - _next/image (image optimization)
    // - favicon.ico, sitemap.xml, robots.txt (metadata files)
    // - api routes (handled separately)
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|showcase/|models/|images/).*)",
  ],
};
