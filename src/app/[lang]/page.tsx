// Landing page — the main entry point for the site
// Composes Hero, 3D Showcase (placeholder), New Arrivals, Brand Story, and Brand Logos
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "./dictionaries";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturedShowcasePlaceholder } from "@/components/landing/FeaturedShowcasePlaceholder";
import { NewArrivalsStrip } from "@/components/landing/NewArrivalsStrip";
import { BrandStory } from "@/components/landing/BrandStory";
import { BrandLogos } from "@/components/landing/BrandLogos";

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
      {/* Full-viewport hero with diorama background and CTA */}
      <HeroSection lang={lang} dict={dict} />

      {/* 3D featured showcase — placeholder until Task 5 (React Three Fiber) */}
      <FeaturedShowcasePlaceholder dict={dict} />

      {/* Horizontal scrollable row of latest products */}
      <NewArrivalsStrip lang={lang} dict={dict} />

      {/* Cinematic brand story section */}
      <BrandStory dict={dict} />

      {/* Brand logos grid — Mini GT, Hot Wheels, Inno64, Pop Race */}
      <BrandLogos lang={lang} dict={dict} />
    </>
  );
}
