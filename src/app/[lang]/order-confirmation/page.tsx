// Order confirmation page — shown after successful checkout
// Displays order number, summary, and next steps
import { notFound } from "next/navigation";
import Link from "next/link";
import { getDictionary, hasLocale } from "../dictionaries";

export const metadata = {
  title: "Order Confirmed — Collector In Town",
};

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const { lang } = await params;
  const { order } = await searchParams;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const orderNumber = order || "CIT-XXXXXX";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      {/* Success icon */}
      <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      {/* Heading */}
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl text-text-primary mb-3">
        {dict.checkout.orderPlaced}
      </h1>

      {/* Order number */}
      <p className="text-text-secondary mb-1">{dict.checkout.orderNumber}</p>
      <p className="text-accent text-2xl font-bold mb-8">{orderNumber}</p>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
        {/* What's next */}
        <div className="bg-surface rounded-xl border border-border p-5">
          <h3 className="text-text-primary font-semibold mb-2">What&apos;s Next?</h3>
          <ul className="text-text-secondary text-sm space-y-2">
            <li>1. We&apos;ll confirm your order via email</li>
            <li>2. Your items will be packed with care</li>
            <li>3. Delivery within 1-5 business days</li>
          </ul>
        </div>

        {/* Track order */}
        <div className="bg-surface rounded-xl border border-border p-5">
          <h3 className="text-text-primary font-semibold mb-2">{dict.account.trackOrder}</h3>
          <p className="text-text-secondary text-sm mb-3">
            Use your order number to track delivery status anytime.
          </p>
          <Link
            href={`/${lang}/track?token=${orderNumber}`}
            className="text-accent text-sm hover:underline"
          >
            {dict.account.trackOrder} &rarr;
          </Link>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href={`/${lang}/products/new-arrivals`}
          className="px-6 py-3 bg-accent text-background rounded-lg font-semibold
                     hover:bg-accent-hover transition-colors"
        >
          {dict.cart.continueShopping}
        </Link>
        <Link
          href={`/${lang}/track`}
          className="px-6 py-3 border border-border text-text-primary rounded-lg font-semibold
                     hover:bg-surface-hover transition-colors"
        >
          {dict.account.trackOrder}
        </Link>
      </div>
    </div>
  );
}
