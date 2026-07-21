// CheckoutForm — multi-step checkout with contact, delivery, payment, and review
// Client component that reads cart from CartContext
"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import type { Dictionary } from "@/app/[lang]/dictionaries";

// Delivery zones with fees — will come from Supabase when connected
const DELIVERY_ZONES = [
  { id: "yangon", name_en: "Yangon", name_my: "ရန်ကုန်", fee: 2000 },
  { id: "mandalay", name_en: "Mandalay", name_my: "မန္တလေး", fee: 3500 },
  { id: "naypyidaw", name_en: "Naypyidaw", name_my: "နေပြည်တော်", fee: 3000 },
  { id: "other", name_en: "Other Regions", name_my: "အခြားဒေသများ", fee: 5000 },
];

// Placeholder product data for resolving cart items
const PRODUCT_CATALOG = [
  { id: "1", name_en: "Nissan GT-R R35 Liberty Walk", name_my: "နစ်ဆန် GT-R R35 Liberty Walk", slug: "nissan-gtr-r35-liberty-walk", brand: "mini-gt", price: 45000, photos: [] as string[] },
  { id: "2", name_en: "Porsche 911 GT3 RS", name_my: "ပေါ့ရှ 911 GT3 RS", slug: "porsche-911-gt3-rs", brand: "mini-gt", price: 52000, photos: [] as string[] },
  { id: "3", name_en: "Toyota AE86 Sprinter Trueno", name_my: "တိုယိုတာ AE86 Sprinter Trueno", slug: "toyota-ae86-sprinter-trueno", brand: "hot-wheels", price: 12000, photos: [] as string[] },
  { id: "4", name_en: "Mazda RX-7 FD3S Spirit R", name_my: "မဇ်ဒါ RX-7 FD3S Spirit R", slug: "mazda-rx7-fd3s-spirit-r", brand: "hot-wheels", price: 15000, photos: [] as string[] },
  { id: "5", name_en: "Honda Civic Type-R EK9", name_my: "ဟွန်ဒါ Civic Type-R EK9", slug: "honda-civic-type-r-ek9", brand: "inno64", price: 38000, photos: [] as string[] },
  { id: "6", name_en: "Mitsubishi Lancer Evolution III", name_my: "မစ်ဆူဘီရှီ Lancer Evolution III", slug: "mitsubishi-lancer-evo-iii", brand: "inno64", price: 42000, photos: [] as string[] },
  { id: "7", name_en: "Nissan Skyline GT-R R34 V-Spec II", name_my: "နစ်ဆန် Skyline GT-R R34 V-Spec II", slug: "nissan-skyline-gtr-r34-vspec-ii", brand: "pop-race", price: 35000, photos: [] as string[] },
  { id: "8", name_en: "Toyota Supra A80 TRD", name_my: "တိုယိုတာ Supra A80 TRD", slug: "toyota-supra-a80-trd", brand: "pop-race", price: 32000, photos: [] as string[] },
];

// Steps in the checkout flow
type Step = "contact" | "delivery" | "payment" | "review";
const STEPS: Step[] = ["contact", "delivery", "payment", "review"];

interface CheckoutFormProps {
  lang: string;
  dict: Dictionary;
}

export function CheckoutForm({ lang, dict }: CheckoutFormProps) {
  const { items, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState<Step>("contact");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  // Form state
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [delivery, setDelivery] = useState({
    address: "", township: "", city: "", zone: "", notes: "",
  });
  const [payment, setPayment] = useState<"kbzpay" | "card">("kbzpay");

  // Resolve cart items
  const cartProducts = items
    .map((item) => {
      const product = PRODUCT_CATALOG.find((p) => p.id === item.productId);
      return product ? { product, quantity: item.quantity } : null;
    })
    .filter(Boolean) as { product: (typeof PRODUCT_CATALOG)[number]; quantity: number }[];

  const subtotal = cartProducts.reduce(
    (sum, { product, quantity }) => sum + product.price * quantity, 0
  );
  const zone = DELIVERY_ZONES.find((z) => z.id === delivery.zone);
  const deliveryFee = zone?.fee || 0;
  const total = subtotal + deliveryFee;

  const currentStepIndex = STEPS.indexOf(currentStep);

  // Validate current step before advancing
  const canAdvance = () => {
    switch (currentStep) {
      case "contact":
        return contact.name.trim() && contact.email.trim() && contact.phone.trim();
      case "delivery":
        return delivery.address.trim() && delivery.township.trim() &&
               delivery.city.trim() && delivery.zone;
      case "payment":
        return true;
      default:
        return false;
    }
  };

  const goNext = () => {
    if (!canAdvance()) return;
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) setCurrentStep(STEPS[nextIndex]);
  };

  const goBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) setCurrentStep(STEPS[prevIndex]);
  };

  // Place order — will call API in production
  const handlePlaceOrder = () => {
    const id = `CIT-${Date.now().toString(36).toUpperCase()}`;
    setOrderNumber(id);
    setOrderPlaced(true);
    clearCart();
  };

  // Order placed success screen
  if (orderPlaced) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="font-[family-name:var(--font-cinzel)] text-2xl text-text-primary mb-2">
          {dict.checkout.orderPlaced}
        </h2>
        <p className="text-text-secondary mb-1">{dict.checkout.orderNumber}</p>
        <p className="text-accent text-xl font-bold mb-6">{orderNumber}</p>
        <Link
          href={`/${lang}`}
          className="inline-block px-6 py-3 bg-accent text-background rounded-lg
                     font-semibold hover:bg-accent-hover transition-colors"
        >
          {dict.cart.continueShopping}
        </Link>
      </div>
    );
  }

  // Empty cart redirect
  if (cartProducts.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-text-secondary text-lg mb-4">{dict.cart.empty}</p>
        <Link
          href={`/${lang}/products/new-arrivals`}
          className="inline-block px-6 py-3 bg-accent text-background rounded-lg
                     font-semibold hover:bg-accent-hover transition-colors"
        >
          {dict.cart.continueShopping}
        </Link>
      </div>
    );
  }

  // Shared input styles
  const inputClass = "w-full bg-background border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Form steps */}
      <div className="lg:col-span-2">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <button
                onClick={() => i < currentStepIndex ? setCurrentStep(step) : undefined}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                  ${i === currentStepIndex
                    ? "bg-accent text-background"
                    : i < currentStepIndex
                      ? "bg-success text-white cursor-pointer"
                      : "bg-surface text-text-muted"
                  }`}
              >
                {i < currentStepIndex ? "✓" : i + 1}
              </button>
              {i < STEPS.length - 1 && (
                <div className={`w-8 sm:w-12 h-0.5 ${i < currentStepIndex ? "bg-success" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Contact Information */}
        {currentStep === "contact" && (
          <div className="space-y-4">
            <h2 className="text-text-primary font-semibold text-lg mb-4">{dict.checkout.contact}</h2>

            {/* Guest checkout notice */}
            <p className="text-text-muted text-sm mb-4">
              {dict.checkout.guestCheckout} — {dict.checkout.orSignIn}
            </p>

            <div>
              <label className="text-text-secondary text-sm block mb-1.5">{dict.checkout.name}</label>
              <input
                type="text"
                value={contact.name}
                onChange={(e) => setContact({ ...contact, name: e.target.value })}
                className={inputClass}
                placeholder="Aung Kyaw"
              />
            </div>
            <div>
              <label className="text-text-secondary text-sm block mb-1.5">{dict.checkout.email}</label>
              <input
                type="email"
                value={contact.email}
                onChange={(e) => setContact({ ...contact, email: e.target.value })}
                className={inputClass}
                placeholder="aung@email.com"
              />
            </div>
            <div>
              <label className="text-text-secondary text-sm block mb-1.5">{dict.checkout.phone}</label>
              <input
                type="tel"
                value={contact.phone}
                onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                className={inputClass}
                placeholder="09-xxx-xxx-xxx"
              />
            </div>
          </div>
        )}

        {/* Step 2: Delivery Address */}
        {currentStep === "delivery" && (
          <div className="space-y-4">
            <h2 className="text-text-primary font-semibold text-lg mb-4">{dict.checkout.delivery}</h2>

            <div>
              <label className="text-text-secondary text-sm block mb-1.5">{dict.checkout.deliveryZone}</label>
              <select
                value={delivery.zone}
                onChange={(e) => setDelivery({ ...delivery, zone: e.target.value })}
                className={inputClass}
              >
                <option value="">-- {dict.checkout.deliveryZone} --</option>
                {DELIVERY_ZONES.map((z) => (
                  <option key={z.id} value={z.id}>
                    {lang === "my" ? z.name_my : z.name_en} — {formatPrice(z.fee)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-text-secondary text-sm block mb-1.5">{dict.checkout.address}</label>
              <input
                type="text"
                value={delivery.address}
                onChange={(e) => setDelivery({ ...delivery, address: e.target.value })}
                className={inputClass}
                placeholder="123 Bogyoke Road"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-text-secondary text-sm block mb-1.5">{dict.checkout.township}</label>
                <input
                  type="text"
                  value={delivery.township}
                  onChange={(e) => setDelivery({ ...delivery, township: e.target.value })}
                  className={inputClass}
                  placeholder="Latha"
                />
              </div>
              <div>
                <label className="text-text-secondary text-sm block mb-1.5">{dict.checkout.city}</label>
                <input
                  type="text"
                  value={delivery.city}
                  onChange={(e) => setDelivery({ ...delivery, city: e.target.value })}
                  className={inputClass}
                  placeholder="Yangon"
                />
              </div>
            </div>
            <div>
              <label className="text-text-secondary text-sm block mb-1.5">{dict.checkout.notes}</label>
              <textarea
                value={delivery.notes}
                onChange={(e) => setDelivery({ ...delivery, notes: e.target.value })}
                className={`${inputClass} resize-none h-20`}
                placeholder="Leave at front desk, call before delivery, etc."
              />
            </div>
          </div>
        )}

        {/* Step 3: Payment Method */}
        {currentStep === "payment" && (
          <div className="space-y-4">
            <h2 className="text-text-primary font-semibold text-lg mb-4">{dict.checkout.payment}</h2>

            {/* KBZPay option */}
            <label className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors
              ${payment === "kbzpay" ? "border-accent bg-accent/5" : "border-border hover:border-accent/30"}`}
            >
              <input
                type="radio"
                name="payment"
                value="kbzpay"
                checked={payment === "kbzpay"}
                onChange={() => setPayment("kbzpay")}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${payment === "kbzpay" ? "border-accent" : "border-border"}`}>
                {payment === "kbzpay" && <div className="w-2.5 h-2.5 rounded-full bg-accent" />}
              </div>
              <div>
                <p className="text-text-primary font-medium">{dict.checkout.kbzpay}</p>
                <p className="text-text-muted text-xs">Pay via KBZPay mobile wallet</p>
              </div>
            </label>

            {/* Card option */}
            <label className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors
              ${payment === "card" ? "border-accent bg-accent/5" : "border-border hover:border-accent/30"}`}
            >
              <input
                type="radio"
                name="payment"
                value="card"
                checked={payment === "card"}
                onChange={() => setPayment("card")}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${payment === "card" ? "border-accent" : "border-border"}`}>
                {payment === "card" && <div className="w-2.5 h-2.5 rounded-full bg-accent" />}
              </div>
              <div>
                <p className="text-text-primary font-medium">{dict.checkout.card}</p>
                <p className="text-text-muted text-xs">Visa, Mastercard, Apple Pay</p>
              </div>
            </label>
          </div>
        )}

        {/* Step 4: Review Order */}
        {currentStep === "review" && (
          <div className="space-y-6">
            <h2 className="text-text-primary font-semibold text-lg mb-4">{dict.checkout.review}</h2>

            {/* Contact summary */}
            <div className="bg-surface rounded-lg p-4 border border-border">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-text-primary font-medium text-sm">{dict.checkout.contact}</h3>
                <button onClick={() => setCurrentStep("contact")} className="text-accent text-xs hover:underline">
                  {dict.common.edit}
                </button>
              </div>
              <p className="text-text-secondary text-sm">{contact.name}</p>
              <p className="text-text-secondary text-sm">{contact.email} · {contact.phone}</p>
            </div>

            {/* Delivery summary */}
            <div className="bg-surface rounded-lg p-4 border border-border">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-text-primary font-medium text-sm">{dict.checkout.delivery}</h3>
                <button onClick={() => setCurrentStep("delivery")} className="text-accent text-xs hover:underline">
                  {dict.common.edit}
                </button>
              </div>
              <p className="text-text-secondary text-sm">{delivery.address}</p>
              <p className="text-text-secondary text-sm">
                {delivery.township}, {delivery.city}
                {zone && ` — ${lang === "my" ? zone.name_my : zone.name_en}`}
              </p>
              {delivery.notes && (
                <p className="text-text-muted text-xs mt-1">{delivery.notes}</p>
              )}
            </div>

            {/* Payment summary */}
            <div className="bg-surface rounded-lg p-4 border border-border">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-text-primary font-medium text-sm">{dict.checkout.payment}</h3>
                <button onClick={() => setCurrentStep("payment")} className="text-accent text-xs hover:underline">
                  {dict.common.edit}
                </button>
              </div>
              <p className="text-text-secondary text-sm">
                {payment === "kbzpay" ? dict.checkout.kbzpay : dict.checkout.card}
              </p>
            </div>

            {/* Items summary */}
            <div className="space-y-3">
              {cartProducts.map(({ product, quantity }) => {
                const name = lang === "my" ? product.name_my : product.name_en;
                return (
                  <div key={product.id} className="flex justify-between items-center text-sm">
                    <span className="text-text-secondary">
                      {name} × {quantity}
                    </span>
                    <span className="text-text-primary">{formatPrice(product.price * quantity)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8 pt-4 border-t border-border">
          {currentStepIndex > 0 ? (
            <button
              onClick={goBack}
              className="px-6 py-2.5 text-text-secondary hover:text-text-primary transition-colors text-sm"
            >
              &larr; {dict.common.back}
            </button>
          ) : (
            <Link href={`/${lang}/cart`} className="px-6 py-2.5 text-text-secondary hover:text-text-primary transition-colors text-sm">
              &larr; {dict.common.back}
            </Link>
          )}

          {currentStep === "review" ? (
            <button
              onClick={handlePlaceOrder}
              className="px-8 py-3 bg-accent text-background rounded-lg font-semibold
                         hover:bg-accent-hover transition-colors"
            >
              {dict.checkout.placeOrder}
            </button>
          ) : (
            <button
              onClick={goNext}
              disabled={!canAdvance()}
              className="px-8 py-3 bg-accent text-background rounded-lg font-semibold
                         hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {dict.common.next} &rarr;
            </button>
          )}
        </div>
      </div>

      {/* Right: Order summary (sticky sidebar) */}
      <div className="hidden lg:block">
        <div className="bg-surface rounded-xl border border-border p-6 sticky top-24">
          <h3 className="text-text-primary font-semibold mb-4">{dict.checkout.review}</h3>

          {/* Items */}
          <div className="space-y-3 mb-4">
            {cartProducts.map(({ product, quantity }) => {
              const name = lang === "my" ? product.name_my : product.name_en;
              return (
                <div key={product.id} className="flex justify-between text-sm">
                  <span className="text-text-secondary truncate mr-2">{name} ×{quantity}</span>
                  <span className="text-text-primary shrink-0">{formatPrice(product.price * quantity)}</span>
                </div>
              );
            })}
          </div>

          {/* Totals */}
          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">{dict.cart.subtotal}</span>
              <span className="text-text-primary">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">{dict.cart.deliveryFee}</span>
              <span className="text-text-primary">
                {zone ? formatPrice(deliveryFee) : "—"}
              </span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t border-border pt-3">
              <span className="text-text-primary">{dict.cart.total}</span>
              <span className="text-accent">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
