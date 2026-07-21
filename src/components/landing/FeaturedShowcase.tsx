// Featured Showcase — cinematic product photo carousel
// Premium presentation: floating car, spotlight glow, reflection, smooth transitions
// No 3D models needed — beautiful photography sells better than janky 3D
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { Dictionary } from "@/app/[lang]/dictionaries";

interface FeaturedCar {
  id: string;
  name: string;
  price: number;
  slug: string;
  brand: string;
  brandDisplay: string;
  scale: string;
  image: string;
}

interface FeaturedShowcaseProps {
  lang: string;
  dict: Dictionary;
  cars?: FeaturedCar[];
}

// Placeholder featured cars — replace images with real product photos
const PLACEHOLDER_CARS: FeaturedCar[] = [
  {
    id: "1",
    name: "Nissan GT-R Nismo",
    price: 45000,
    slug: "nissan-gtr-r35-liberty-walk",
    brand: "mini-gt",
    brandDisplay: "MINI GT",
    scale: "1:64",
    image: "/showcase/nissan-gtr-nismo.png",
  },
{
    id: "3",
    name: "Liberty Walk F40",
    price: 35000,
    slug: "liberty-walk-f40",
    brand: "inno64",
    brandDisplay: "INNO64",
    scale: "1:64",
    image: "/showcase/inno64-liberty-walk-f40.png",
  },
  {
    id: "4",
    name: "1968 Custom Camaro Twin Mill",
    price: 15000,
    slug: "1968-custom-camaro-twin-mill",
    brand: "hot-wheels",
    brandDisplay: "HOT WHEELS",
    scale: "1:64",
    image: "/showcase/hotwheels-camaro-twin-mill.png",
  },
  {
    id: "5",
    name: "EVA RT Aston Martin GT3",
    price: 28000,
    slug: "eva-rt-aston-martin-gt3",
    brand: "pop-race",
    brandDisplay: "POP RACE",
    scale: "1:64",
    image: "/showcase/poprace-aston-martin-gt3.png",
  },
];

export function FeaturedShowcase({ lang, dict, cars }: FeaturedShowcaseProps) {
  const featuredCars = cars || PLACEHOLDER_CARS;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const activeCar = featuredCars[activeIndex];

  // Touch swipe tracking
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const switchCar = useCallback((newIndex: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex(newIndex);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 300);
  }, [isTransitioning]);

  const prevCar = useCallback(() => {
    switchCar(activeIndex === 0 ? featuredCars.length - 1 : activeIndex - 1);
  }, [activeIndex, featuredCars.length, switchCar]);

  const nextCar = useCallback(() => {
    switchCar(activeIndex === featuredCars.length - 1 ? 0 : activeIndex + 1);
  }, [activeIndex, featuredCars.length, switchCar]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextCar();
      else prevCar();
    }
  }, [nextCar, prevCar]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") prevCar();
    if (e.key === "ArrowRight") nextCar();
  }, [prevCar, nextCar]);

  // Auto-advance every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((i) => (i === featuredCars.length - 1 ? 0 : i + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [featuredCars.length]);

  return (
    <section className="relative overflow-hidden">
      {/* Background — layered dark gradients with colored accent glows */}
      <div className="absolute inset-0 bg-[#07070a]">
        {/* Top-down spotlight gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(201,168,76,0.08),transparent_70%)]" />
        {/* Center warm glow behind the car */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_45%,rgba(201,168,76,0.06),transparent_70%)]" />
        {/* Bottom blue accent */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_30%_at_50%_100%,rgba(68,102,255,0.04),transparent_60%)]" />
      </div>

      {/* Section header */}
      <div className="relative z-10 text-center pt-12 sm:pt-16 md:pt-20 pb-4 sm:pb-6">
        <p className="text-accent/40 text-[10px] sm:text-xs uppercase tracking-[0.35em] mb-3">
          {dict.sections.featuredShowcase}
        </p>
        <h2 className="font-[family-name:var(--font-cinzel)] text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white/90 tracking-wide">
          {dict.sections.featuredShowcaseDesc}
        </h2>
      </div>

      {/* Main showcase area */}
      <div
        className="relative z-10 w-full h-[400px] sm:h-[480px] md:h-[560px] lg:h-[620px]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="region"
        aria-label="Featured car showcase"
      >
        {/* Spotlight beams from above */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] sm:w-[700px] h-[300px] sm:h-[400px]
                        bg-[conic-gradient(from_180deg_at_50%_0%,transparent_40%,rgba(255,255,255,0.02)_45%,rgba(255,255,255,0.04)_50%,rgba(255,255,255,0.02)_55%,transparent_60%)]
                        pointer-events-none" />

        {/* Product image — the star of the show */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500
                         ${isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
          <div className="relative group">
            {/* Glow under the car */}
            <div className="absolute -bottom-6 sm:-bottom-8 left-1/2 -translate-x-1/2
                            w-[70%] h-[30px] sm:h-[40px]
                            bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.15),rgba(68,102,255,0.08)_40%,transparent_70%)]
                            blur-md rounded-full" />

            {/* Floating animation wrapper */}
            <div className="animate-[float_4s_ease-in-out_infinite]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeCar.image}
                alt={`${activeCar.brandDisplay} ${activeCar.name}`}
                className="w-[320px] sm:w-[420px] md:w-[520px] lg:w-[600px] h-auto
                           object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.8)]
                           transition-transform duration-700 ease-out
                           group-hover:scale-[1.03]"
                draggable={false}
              />
            </div>

            {/* Reflection */}
            <div className="absolute top-full left-0 right-0 h-[100px] sm:h-[140px] overflow-hidden
                            opacity-[0.07] pointer-events-none -scale-y-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeCar.image}
                alt=""
                className="w-[320px] sm:w-[420px] md:w-[520px] lg:w-[600px] h-auto
                           object-contain mx-auto
                           [mask-image:linear-gradient(to_bottom,white,transparent)]"
                draggable={false}
              />
            </div>
          </div>
        </div>

        {/* Pedestal line — thin glowing bar beneath the car */}
        <div className="absolute bottom-[120px] sm:bottom-[150px] md:bottom-[170px] left-1/2 -translate-x-1/2
                        w-[200px] sm:w-[280px] md:w-[360px] h-[1px]
                        bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        <div className="absolute bottom-[119px] sm:bottom-[149px] md:bottom-[169px] left-1/2 -translate-x-1/2
                        w-[120px] sm:w-[180px] md:w-[240px] h-[1px]
                        bg-gradient-to-r from-transparent via-blue-500/20 to-transparent blur-[1px]" />

        {/* Navigation arrows */}
        <button
          onClick={prevCar}
          className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 z-20
                     w-10 h-10 sm:w-12 sm:h-12 rounded-full
                     bg-white/[0.03] backdrop-blur-sm border border-white/[0.06]
                     flex items-center justify-center
                     hover:bg-accent/10 hover:border-accent/20 transition-all duration-300
                     text-white/30 hover:text-accent"
          aria-label="Previous car"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={nextCar}
          className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 z-20
                     w-10 h-10 sm:w-12 sm:h-12 rounded-full
                     bg-white/[0.03] backdrop-blur-sm border border-white/[0.06]
                     flex items-center justify-center
                     hover:bg-accent/10 hover:border-accent/20 transition-all duration-300
                     text-white/30 hover:text-accent"
          aria-label="Next car"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Name plate — below the showcase area */}
      <div className="relative z-10 text-center pb-4 sm:pb-6 -mt-8 sm:-mt-4">
        <div className={`inline-block transition-all duration-500
                         ${isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}>
          <p className="text-white/25 text-[10px] sm:text-xs font-medium uppercase tracking-[0.3em] mb-1.5">
            {activeCar.brandDisplay} &middot; {activeCar.scale}
          </p>
          <Link href={`/${lang}/products/${activeCar.brand}/${activeCar.slug}`}>
            <h3 className="text-white font-[family-name:var(--font-cinzel)] text-xl sm:text-2xl md:text-3xl
                           hover:text-accent transition-colors duration-300 tracking-wide mb-2">
              {activeCar.name}
            </h3>
          </Link>
          <span className="text-accent font-semibold text-base sm:text-lg tracking-wide">
            {formatPrice(activeCar.price)}
          </span>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="relative z-10 flex justify-center gap-2.5 pb-12 sm:pb-16 md:pb-20">
        {featuredCars.map((car, i) => (
          <button
            key={car.id}
            onClick={() => !isTransitioning && switchCar(i)}
            className={`rounded-full transition-all duration-500 ${
              i === activeIndex
                ? "bg-accent w-8 h-[3px]"
                : "bg-white/10 w-[6px] h-[3px] hover:bg-white/25"
            }`}
            aria-label={`View ${car.name}`}
          />
        ))}
      </div>
    </section>
  );
}
