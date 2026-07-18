// Navbar — premium dark navigation bar with brand links, cart, and locale switcher
// Sticky at top, transparent on scroll-top, solid on scroll
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRANDS } from "@/lib/constants";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { Dictionary } from "@/app/[lang]/dictionaries";

// Props: current locale + full dictionary for translated labels
interface NavbarProps {
  lang: string;
  dict: Dictionary;
}

// Map brand slugs to their dictionary keys for translated names
const BRAND_NAV_KEYS: Record<string, keyof Dictionary["nav"]> = {
  "mini-gt": "miniGt",
  "hot-wheels": "hotWheels",
  inno64: "inno64",
  "pop-race": "popRace",
};

export function Navbar({ lang, dict }: NavbarProps) {
  // Mobile menu toggle state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Check if a nav link is currently active
  const isActive = (href: string) => pathname === href;

  // Build locale-prefixed URL helper
  const localePath = (path: string) => `/${lang}${path}`;

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo — brand name with accent color */}
          <Link
            href={localePath("/")}
            className="flex items-center gap-2 shrink-0"
          >
            <span className="font-[family-name:var(--font-playfair)] text-xl text-accent font-bold">
              Collector In Town
            </span>
          </Link>

          {/* Desktop navigation links — hidden on mobile */}
          <div className="hidden lg:flex items-center gap-1">
            {/* New Arrivals link */}
            <Link
              href={localePath("/products/new-arrivals")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${
                  isActive(localePath("/products/new-arrivals"))
                    ? "text-accent bg-accent/10"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                }`}
            >
              {dict.nav.newArrivals}
            </Link>

            {/* Brand links — one for each of the 4 brands */}
            {BRANDS.map((brand) => (
              <Link
                key={brand.slug}
                href={localePath(`/products/${brand.slug}`)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${
                    isActive(localePath(`/products/${brand.slug}`))
                      ? "text-accent bg-accent/10"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                  }`}
              >
                {dict.nav[BRAND_NAV_KEYS[brand.slug]]}
              </Link>
            ))}
          </div>

          {/* Right side actions — cart, language, account */}
          <div className="flex items-center gap-2">
            {/* Language switcher */}
            <LanguageSwitcher lang={lang} dict={dict} />

            {/* Cart button with icon */}
            <Link
              href={localePath("/cart")}
              className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary
                         hover:bg-surface-hover transition-colors"
              aria-label={dict.nav.cart}
            >
              {/* Shopping bag icon */}
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>

              {/* Cart badge — will be populated by cart context in Task 8 */}
              {/* <span className="absolute -top-1 -right-1 bg-accent text-background
                               text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                0
              </span> */}
            </Link>

            {/* Account button */}
            <Link
              href={localePath("/account")}
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary
                         hover:bg-surface-hover transition-colors"
              aria-label={dict.nav.account}
            >
              {/* User icon */}
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </Link>

            {/* Mobile menu hamburger button — visible only on small screens */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary
                         hover:bg-surface-hover transition-colors"
              aria-label={dict.nav.menu}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                // X icon — close menu
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                // Hamburger icon — open menu
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu — slides down when hamburger is tapped */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border py-4 space-y-1">
            {/* New Arrivals */}
            <Link
              href={localePath("/products/new-arrivals")}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${
                  isActive(localePath("/products/new-arrivals"))
                    ? "text-accent bg-accent/10"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                }`}
            >
              {dict.nav.newArrivals}
            </Link>

            {/* Brand links */}
            {BRANDS.map((brand) => (
              <Link
                key={brand.slug}
                href={localePath(`/products/${brand.slug}`)}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${
                    isActive(localePath(`/products/${brand.slug}`))
                      ? "text-accent bg-accent/10"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                  }`}
              >
                {dict.nav[BRAND_NAV_KEYS[brand.slug]]}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
