// CheckoutForm — multi-step checkout wired to real APIs
// Fetches delivery zones and product data from API, submits orders to POST /api/orders
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import type { Dictionary } from "@/app/[lang]/dictionaries";

// Shape of delivery zone from the API
interface DeliveryZone {
  id: string;
  nameEn: string;
  nameMy: string | null;
  fee: number;
  estimatedTime: string | null;
}

// Shape of product from the API
interface ProductData {
  id: string;
  nameEn: string;
  nameMy: string | null;
  slug: string;
  brand: string;
  price: number;
  images: Array<{ url: string }>;
}

// Steps in the checkout flow
type Step = "contact" | "delivery" | "payment" | "review";
const STEPS: Step[] = ["contact", "delivery", "payment", "review"];

interface CheckoutFormProps {
  lang: string;
  dict: Dictionary;
}

export function CheckoutForm({ lang, dict }: CheckoutFormProps) {
  const { items, clearCart } = useCart();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("contact");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [trackingToken, setTrackingToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Data from APIs
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [productMap, setProductMap] = useState<Map<string, ProductData>>(new Map());
  const [loading, setLoading] = useState(true);

  // Form state
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [delivery, setDelivery] = useState({
    address: "", township: "", city: "", zone: "", notes: "",
  });
  const [promoCode, setPromoCode] = useState("");
  const [payment, setPayment] = useState<"kbzpay">("kbzpay");

  // Fetch delivery zones and product data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch delivery zones and products in parallel
        const [zonesRes, productsRes] = await Promise.all([
          fetch("/api/delivery-zones"),
          items.length > 0
            ? fetch(`/api/products?ids=${items.map((i) => i.productId).join(",")}`)
            : Promise.resolve({ json: async () => ({ products: [] }) } as Response),
        ]);

        const zonesData = await zonesRes.json();
        setZones(zonesData.zones || []);

        const productsData = await productsRes.json();
        const map = new Map<string, ProductData>();
        for (const p of productsData.products || []) {
          map.set(p.id, p);
        }
        setProductMap(map);
      } catch {
        setError("Failed to load checkout data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [items]);

  // Resolve cart items to product data
  const cartProducts = items
    .map((item) => {
      const p = productMap.get(item.productId);
      if (!p) return null;
      return {
        product: p,
        quantity: item.quantity,
      };
    })
    .filter(Boolean) as { product: ProductData; quantity: number }[];

  const subtotal = cartProducts.reduce(
    (sum, { product, quantity }) => sum + product.price * quantity, 0
  );
  const zone = zones.find((z) => z.id === delivery.zone);
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

  // Place order — calls POST /api/orders
  const handlePlaceOrder = async () => {
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: {
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
          },
          delivery: {
            address: delivery.address,
            township: delivery.township,
            city: delivery.city,
            zone: delivery.zone,
            notes: delivery.notes || undefined,
          },
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
          payment_method: payment,
          promo_code: promoCode || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to place order");
      }

      const data = await res.json();
      setOrderNumber(data.order.orderNumber);
      setTrackingToken(data.trackingToken);
      setOrderPlaced(true);
      clearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state while fetching zones and products
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/${lang}`}
            className="inline-block px-6 py-3 bg-accent text-background rounded-lg
                       font-semibold hover:bg-accent-hover transition-colors"
          >
            {dict.cart.continueShopping}
          </Link>
          <Link
            href={`/${lang}/track?token=${trackingToken}`}
            className="inline-block px-6 py-3 border border-border text-text-primary rounded-lg
                       font-semibold hover:bg-surface-hover transition-colors"
          >
            {dict.account.trackOrder}
          </Link>
        </div>
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

  // Helper to get product name based on locale
  const getName = (p: ProductData) => lang === "my" && p.nameMy ? p.nameMy : p.nameEn;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Form steps */}
      <div className="lg:col-span-2">
        {/* Error banner */}
        {error && (
          <div className="bg-error/10 border border-error/20 rounded-lg px-4 py-3 mb-6 text-error text-sm">
            {error}
          </div>
        )}

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
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {lang === "my" && z.nameMy ? z.nameMy : z.nameEn} — {formatPrice(z.fee)}
                    {z.estimatedTime ? ` (${z.estimatedTime})` : ""}
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

            {/* KBZPay option — only payment method at launch */}
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

            {/* Promo code field */}
            <div className="pt-4 border-t border-border">
              <label className="text-text-secondary text-sm block mb-1.5">Promo Code</label>
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                className={inputClass}
                placeholder="WELCOME10"
              />
            </div>
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
                {zone && ` — ${lang === "my" && zone.nameMy ? zone.nameMy : zone.nameEn}`}
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
              <p className="text-text-secondary text-sm">{dict.checkout.kbzpay}</p>
              {promoCode && (
                <p className="text-accent text-xs mt-1">Promo: {promoCode}</p>
              )}
            </div>

            {/* Items summary */}
            <div className="space-y-3">
              {cartProducts.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between items-center text-sm">
                  <span className="text-text-secondary">
                    {getName(product)} × {quantity}
                  </span>
                  <span className="text-text-primary">{formatPrice(product.price * quantity)}</span>
                </div>
              ))}
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
              disabled={submitting}
              className="px-8 py-3 bg-accent text-background rounded-lg font-semibold
                         hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              {submitting ? "Placing Order..." : dict.checkout.placeOrder}
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
            {cartProducts.map(({ product, quantity }) => (
              <div key={product.id} className="flex justify-between text-sm">
                <span className="text-text-secondary truncate mr-2">{getName(product)} ×{quantity}</span>
                <span className="text-text-primary shrink-0">{formatPrice(product.price * quantity)}</span>
              </div>
            ))}
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
