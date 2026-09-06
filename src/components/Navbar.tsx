"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRANDS } from "@/lib/constants";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";
import type { Dictionary } from "@/app/[lang]/dictionaries";

interface NavbarProps {
  lang: string;
  dict: Dictionary;
}

const BRAND_NAV_KEYS: Record<string, keyof Dictionary["nav"]> = {
  "mini-gt": "miniGt",
  "hot-wheels": "hotWheels",
  inno64: "inno64",
  "pop-race": "popRace",
  other: "other",
};

export function Navbar({ lang, dict }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (pathname.includes("/admin") || pathname.includes("/account") || pathname.includes("/sign-in") || pathname.includes("/sign-up")) return null;

  const isActive = (href: string) => pathname === href;
  const localePath = (path: string) => `/${lang}${path}`;

  const navLinkClass = (href: string) =>
    isActive(href)
      ? isDark ? "text-[#c9a84c] bg-[#c9a84c]/10" : "text-[#7a5c1f] bg-[#7a5c1f]/10"
      : isDark ? "text-[#a3a3a3] hover:text-[#f5f5f5] hover:bg-[#1a1a1a]" : "text-[#44403c] hover:text-[#000000] hover:bg-[#f5f5f4]";

  return (
    <header className={`sticky top-0 z-50 border-b ${isDark ? "bg-[#0a0a0a]/80 backdrop-blur-md border-[#262626]" : "bg-[#fafaf9] border-[#e7e5e4]"}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          <Link href={localePath("/")} className="flex items-center gap-3 shrink-0">
            <img src="/images/logo.png" alt="Collector In Town" className="h-20 w-auto" />
            <span className="font-[family-name:var(--font-cinzel)] text-lg font-bold hidden sm:block text-[#c9a84c]">
              Collector In Town
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            <Link
              href={localePath("/products/new-arrivals")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${navLinkClass(localePath("/products/new-arrivals"))}`}
            >
              {dict.nav.newArrivals}
            </Link>

            {BRANDS.map((brand) => (
              <Link
                key={brand.slug}
                href={localePath(`/products/${brand.slug}`)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${navLinkClass(localePath(`/products/${brand.slug}`))}`}
              >
                {dict.nav[BRAND_NAV_KEYS[brand.slug]]}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher lang={lang} dict={dict} />

            <Link
              href={localePath("/cart")}
              className={`relative p-2 rounded-lg transition-colors ${isDark ? "text-[#a3a3a3] hover:text-[#f5f5f5] hover:bg-[#1a1a1a]" : "text-[#44403c] hover:text-[#000000] hover:bg-[#f5f5f4]"}`}
              aria-label={dict.nav.cart}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {itemCount > 0 && (
                <span className={`absolute -top-1 -right-1 text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold ${isDark ? "bg-[#c9a84c] text-[#0a0a0a]" : "bg-[#7a5c1f] text-white"}`}>
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>

            <Link
              href={localePath("/account")}
              className={`p-2 rounded-lg transition-colors ${isDark ? "text-[#a3a3a3] hover:text-[#f5f5f5] hover:bg-[#1a1a1a]" : "text-[#44403c] hover:text-[#000000] hover:bg-[#f5f5f4]"}`}
              aria-label={dict.nav.account}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${isDark ? "text-[#a3a3a3] hover:text-[#f5f5f5] hover:bg-[#1a1a1a]" : "text-[#44403c] hover:text-[#000000] hover:bg-[#f5f5f4]"}`}
              aria-label={dict.nav.menu}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className={`lg:hidden border-t py-4 space-y-1 ${isDark ? "border-[#262626]" : "border-[#e7e5e4]"}`}>
            <Link
              href={localePath("/products/new-arrivals")}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${navLinkClass(localePath("/products/new-arrivals"))}`}
            >
              {dict.nav.newArrivals}
            </Link>
            {BRANDS.map((brand) => (
              <Link
                key={brand.slug}
                href={localePath(`/products/${brand.slug}`)}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${navLinkClass(localePath(`/products/${brand.slug}`))}`}
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
