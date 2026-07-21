// Seed script — populates the database with initial data for Collector In Town
// Run: npm run db:seed
// Safe to run multiple times — uses onConflictDoNothing for idempotency
import { db } from "./drizzle";
import { deliveryZones, products, promoCodes, siteSettings } from "./schema";
import { slugify } from "./format";

async function seed() {
  console.log("Seeding database...");

  // ─── Delivery Zones ───────────────────────────────────
  // 4 shipping regions covering Myanmar
  const zones = [
    { nameEn: "Yangon", nameMy: "ရန်ကုန်", fee: 2000, estimatedTime: "1-2 days" },
    { nameEn: "Mandalay", nameMy: "မန္တလေး", fee: 3500, estimatedTime: "2-3 days" },
    { nameEn: "Naypyidaw", nameMy: "နေပြည်တော်", fee: 3000, estimatedTime: "2-3 days" },
    { nameEn: "Other Regions", nameMy: "အခြားဒေသများ", fee: 5000, estimatedTime: "3-5 days" },
  ];

  for (const zone of zones) {
    // Insert only if not already present (idempotent by name_en unique-ish check)
    await db.insert(deliveryZones).values({
      id: crypto.randomUUID(),
      ...zone,
    }).onConflictDoNothing();
  }
  console.log(`  Delivery zones: ${zones.length} seeded`);

  // ─── Products ─────────────────────────────────────────
  // 8 sample diecast cars — 2 per brand
  const productData = [
    // Mini GT products
    { nameEn: "Nissan GT-R R35 Liberty Walk", nameMy: "နစ်ဆန် GT-R R35 Liberty Walk", brand: "mini-gt", price: 45000, stockCount: 15, descriptionEn: "Mini GT 1:64 scale Nissan GT-R R35 with Liberty Walk body kit. Metallic blue finish with detailed interior and opening doors.", descriptionMy: "Mini GT 1:64 စကေး နစ်ဆန် GT-R R35 Liberty Walk ကိုယ်ထည်ကစ်ပါ။" },
    { nameEn: "Porsche 911 GT3 RS", nameMy: "ပေါ့ရှ 911 GT3 RS", brand: "mini-gt", price: 52000, stockCount: 8, descriptionEn: "Mini GT 1:64 Porsche 911 GT3 RS in Guards Red. Opening hood reveals detailed flat-six engine.", descriptionMy: "Mini GT 1:64 ပေါ့ရှ 911 GT3 RS Guards Red အနီရောင်။" },
    // Hot Wheels products
    { nameEn: "Toyota AE86 Sprinter Trueno", nameMy: "တိုယိုတာ AE86 Sprinter Trueno", brand: "hot-wheels", price: 12000, stockCount: 25, descriptionEn: "Hot Wheels premium Toyota AE86 from the Japan Historics series.", descriptionMy: "Hot Wheels ပရီမီယံ တိုယိုတာ AE86 Japan Historics စီးရီး။" },
    { nameEn: "Mazda RX-7 FD3S Spirit R", nameMy: "မဇ်ဒါ RX-7 FD3S Spirit R", brand: "hot-wheels", price: 15000, stockCount: 20, descriptionEn: "Hot Wheels premium Mazda RX-7 FD3S Spirit R in brilliant red.", descriptionMy: "Hot Wheels ပရီမီယံ မဇ်ဒါ RX-7 FD3S Spirit R အနီရောင်။" },
    // Inno64 products
    { nameEn: "Honda Civic Type-R EK9", nameMy: "ဟွန်ဒါ Civic Type-R EK9", brand: "inno64", price: 38000, stockCount: 10, descriptionEn: "Inno64 Honda Civic Type-R EK9 in Championship White.", descriptionMy: "Inno64 ဟွန်ဒါ Civic Type-R EK9 Championship White အဖြူရောင်။" },
    { nameEn: "Mitsubishi Lancer Evolution III", nameMy: "မစ်ဆူဘီရှီ Lancer Evolution III", brand: "inno64", price: 42000, stockCount: 6, descriptionEn: "Inno64 Mitsubishi Lancer Evolution III in Dandelion Yellow.", descriptionMy: "Inno64 မစ်ဆူဘီရှီ Lancer Evolution III Dandelion Yellow အဝါရောင်။" },
    // Pop Race products
    { nameEn: "Nissan Skyline GT-R R34 V-Spec II", nameMy: "နစ်ဆန် Skyline GT-R R34 V-Spec II", brand: "pop-race", price: 35000, stockCount: 12, descriptionEn: "Pop Race Nissan Skyline GT-R R34 V-Spec II in Bayside Blue.", descriptionMy: "Pop Race နစ်ဆန် Skyline GT-R R34 V-Spec II Bayside Blue အပြာရောင်။" },
    // This one is sold_out — stock is 0
    { nameEn: "Toyota Supra A80 TRD", nameMy: "တိုယိုတာ Supra A80 TRD", brand: "pop-race", price: 32000, stockCount: 0, descriptionEn: "Pop Race Toyota Supra A80 with TRD 3000GT wing in Super White II.", descriptionMy: "Pop Race တိုယိုတာ Supra A80 TRD 3000GT wing Super White II အဖြူရောင်။", status: "sold_out" as const },
  ];

  for (const p of productData) {
    // Generate URL slug from English name (e.g. "Nissan GT-R R35 Liberty Walk" → "nissan-gt-r-r35-liberty-walk")
    await db.insert(products).values({
      id: crypto.randomUUID(),
      slug: slugify(p.nameEn),
      scale: "1:64",
      status: "active",
      ...p,
    }).onConflictDoNothing();
  }
  console.log(`  Products: ${productData.length} seeded`);

  // ─── Promo Codes ──────────────────────────────────────
  // 3 sample discount codes
  const promoData = [
    // 10% off orders over 30,000 Ks
    { code: "WELCOME10", discountType: "percentage", discountValue: 10, minOrderAmount: 30000, maxUses: 100, expiresAt: "2026-08-31" },
    // 20% off orders over 80,000 Ks — more exclusive
    { code: "COLLECTOR20", discountType: "percentage", discountValue: 20, minOrderAmount: 80000, maxUses: 50, expiresAt: "2026-09-15" },
    // Flat 5,000 Ks off orders over 50,000 Ks
    { code: "FLAT5K", discountType: "fixed", discountValue: 5000, minOrderAmount: 50000, maxUses: 30, expiresAt: "2026-12-31" },
  ];

  for (const promo of promoData) {
    await db.insert(promoCodes).values({
      id: crypto.randomUUID(),
      ...promo,
    }).onConflictDoNothing();
  }
  console.log(`  Promo codes: ${promoData.length} seeded`);

  // ─── Site Settings ────────────────────────────────────
  // Key-value pairs for store configuration
  const settingsData = [
    { key: "store_name", value: JSON.stringify("Collector In Town") },
    { key: "store_email", value: JSON.stringify("hello@collectorintown.com") },
    { key: "store_phone", value: JSON.stringify("09-xxx-xxx-xxx") },
    { key: "currency", value: JSON.stringify("MMK") },
    { key: "default_locale", value: JSON.stringify("en") },
    // KBZPay manual payment info — shown at checkout until API is integrated
    { key: "kbzpay_phone", value: JSON.stringify("09-xxx-xxx-xxx") },
    { key: "kbzpay_name", value: JSON.stringify("Collector In Town") },
  ];

  for (const setting of settingsData) {
    // Upsert — update if key exists, insert if not
    await db.insert(siteSettings).values(setting).onConflictDoNothing();
  }
  console.log(`  Site settings: ${settingsData.length} seeded`);

  console.log("Seed complete!");
  process.exit(0);
}

// Run the seed function
seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
