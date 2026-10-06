// Landing page — the main entry point for the site
// Composes Hero, 3D Showcase (placeholder), New Arrivals, Brand Story, and Brand Logos
// Revalidate every 60 seconds — serves cached page, refreshes in background
export const revalidate = 60;

import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "./dictionaries";
import { HeroSection } from "@/components/landing/HeroSection";
import { NewArrivalsStrip } from "@/components/landing/NewArrivalsStrip";
import { BrandProductsSection } from "@/components/landing/BrandProductsSection";
import { BrandStory } from "@/components/landing/BrandStory";
import { BrandLogos } from "@/components/landing/BrandLogos";
import { ThemeToggle } from "@/components/landing/ThemeToggle";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>; // params is a Promise in Next.js 15+
}) {
  const { lang } = await params;

  // Validate locale — show 404 for unsupported locales
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <>
      {/* Dark/Light theme toggle — floating button */}
      <ThemeToggle />

      {/* Full-viewport hero with diorama background and CTA */}
      <HeroSection lang={lang} dict={dict} />

      {/* Special Items — curated/limited edition picks */}
      <BrandProductsSection lang={lang} brandSlug="special-items" brandName="Special Items" />

      {/* Horizontal scrollable row of latest products */}
      <NewArrivalsStrip lang={lang} dict={dict} />

      {/* Brand-specific product sections */}
      <BrandProductsSection lang={lang} brandSlug="mini-gt" brandName="Mini GT" brandLogo="/images/brands/mini-gt.png" />
      <BrandProductsSection lang={lang} brandSlug="hot-wheels" brandName="Hot Wheels" brandLogo="/images/brands/hot-wheels.png" />
      <BrandProductsSection lang={lang} brandSlug="inno64" brandName="Inno64" brandLogo="/images/brands/inno64-dark.svg" />
      <BrandProductsSection lang={lang} brandSlug="pop-race" brandName="Pop Race" brandLogo="/images/brands/pop-race.png" />
      <BrandProductsSection lang={lang} brandSlug="tomica" brandName="Tomica" brandLogo="/images/brands/tomica.webp" />
      <BrandProductsSection lang={lang} brandSlug="trends-hobby" brandName="Trends Hobby" brandLogo="/images/brands/trends-hobby.webp" />
      <BrandProductsSection lang={lang} brandSlug="tarmac" brandName="Tarmac Works" brandLogo="/images/brands/tarmac.png" />
      <BrandProductsSection lang={lang} brandSlug="greenlight" brandName="Greenlight" brandLogo="/images/brands/greenlight.webp" />

      {/* Cinematic brand story section */}
      <BrandStory dict={dict} />

      {/* Brand logos grid — Mini GT, Hot Wheels, Inno64, Pop Race */}
      <BrandLogos lang={lang} dict={dict} />
    </>
  );
}
