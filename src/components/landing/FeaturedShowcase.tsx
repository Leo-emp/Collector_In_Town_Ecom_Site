// 3D Featured Showcase — horizontal row of interactive 3D car models
// Each car can be dragged to rotate independently
// Uses React Three Fiber with Canvas for WebGL rendering
"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import Link from "next/link";
import { CarModel } from "./CarModel";
import { formatPrice } from "@/lib/format";
import type { Dictionary } from "@/app/[lang]/dictionaries";

interface FeaturedCar {
  id: string;
  name: string;
  price: number;
  slug: string;
  modelUrl?: string; // GLB file URL — optional, uses placeholder if not set
}

interface FeaturedShowcaseProps {
  lang: string;
  dict: Dictionary;
  cars?: FeaturedCar[]; // From Supabase featured_3d_models table
}

// Placeholder featured cars — used until real 3D models are uploaded
const PLACEHOLDER_CARS: FeaturedCar[] = [
  { id: "1", name: "Nissan GT-R R35", price: 45000, slug: "nissan-gtr-r35-liberty-walk" },
  { id: "2", name: "Porsche 911 GT3 RS", price: 52000, slug: "porsche-911-gt3-rs" },
  { id: "3", name: "Toyota AE86", price: 12000, slug: "toyota-ae86-sprinter-trueno" },
  { id: "4", name: "Mazda RX-7 FD3S", price: 15000, slug: "mazda-rx7-fd3s-spirit-r" },
  { id: "5", name: "Honda Civic EK9", price: 38000, slug: "honda-civic-type-r-ek9" },
];

// Loading fallback — shown while the 3D scene initializes
function ModelLoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-text-muted/30 animate-pulse">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      </div>
    </div>
  );
}

export function FeaturedShowcase({ lang, dict, cars }: FeaturedShowcaseProps) {
  const featuredCars = cars || PLACEHOLDER_CARS;

  return (
    <section className="py-16 px-4 border-t border-border">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-10">
          <p className="text-accent/60 text-sm uppercase tracking-[0.3em] mb-3">
            {dict.sections.featuredShowcase}
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl text-text-primary">
            {dict.sections.featuredShowcaseDesc}
          </h2>
          <p className="text-text-muted text-sm mt-3">
            Drag to rotate
          </p>
        </div>

        {/* Horizontal scrollable 3D showcase */}
        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory
                        -mx-4 px-4 scrollbar-hide">
          {featuredCars.map((car) => (
            <div key={car.id} className="flex-shrink-0 w-[280px] sm:w-[320px] snap-center">
              {/* 3D Canvas container */}
              <div className="aspect-[4/3] bg-surface rounded-xl border border-border
                              overflow-hidden relative group hover:border-accent/30 transition-colors">
                <Suspense fallback={<ModelLoadingFallback />}>
                  <Canvas
                    camera={{ position: [2, 1.5, 2], fov: 40 }}
                    style={{ background: "transparent" }}
                  >
                    <CarModel modelUrl={car.modelUrl} />
                  </Canvas>
                </Suspense>
              </div>

              {/* Car info below the 3D viewer */}
              <Link
                href={`/${lang}/products/${car.slug}`}
                className="block mt-3 text-center group"
              >
                <h3 className="text-text-primary text-sm font-medium group-hover:text-accent transition-colors">
                  {car.name}
                </h3>
                <p className="text-accent font-semibold text-sm mt-1">
                  {formatPrice(car.price)}
                </p>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
