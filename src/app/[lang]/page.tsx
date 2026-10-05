// Landing page — the main entry point for the site
// Composes Hero, 3D Showcase (placeholder), New Arrivals, Brand Story, and Brand Logos
// Force dynamic rendering — NewArrivalsStrip queries the database
export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "./dictionaries";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturedShowcase } from "@/components/landing/FeaturedShowcase";
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

      {/* 3D featured showcase — interactive car models with drag-to-rotate */}
      <FeaturedShowcase lang={lang} dict={dict} />

      {/* Horizontal scrollable row of latest products */}
      <NewArrivalsStrip lang={lang} dict={dict} />

      {/* Brand-specific product sections */}
      <BrandProductsSection lang={lang} brandSlug="mini-gt" brandName="Mini GT" brandLogo="/images/brands/mini-gt.png" />
      <BrandProductsSection lang={lang} brandSlug="hot-wheels" brandName="Hot Wheels" brandLogo="/images/brands/hot-wheels.png" />
      <BrandProductsSection lang={lang} brandSlug="inno64" brandName="Inno64" brandLogo="/images/brands/inno64-dark.svg" />
      <BrandProductsSection lang={lang} brandSlug="pop-race" brandName="Pop Race" brandLogo="/images/brands/pop-race.png" />

      {/* Cinematic brand story section */}
      <BrandStory dict={dict} />

      {/* Brand logos grid — Mini GT, Hot Wheels, Inno64, Pop Race */}
      <BrandLogos lang={lang} dict={dict} />
    </>
  );
}
