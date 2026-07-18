// Account page — customer profile and order history
// Will integrate with Supabase Auth when connected
import { notFound } from "next/navigation";
import Link from "next/link";
import { getDictionary, hasLocale } from "../dictionaries";
import { formatPrice } from "@/lib/format";

export const metadata = {
  title: "My Account — Collector In Town",
};

// Placeholder order history — will come from Supabase
const MOCK_ORDERS = [
  {
    id: "CIT-ABC123",
    status: "delivered",
    total: 97000,
    items_count: 2,
    created_at: "2026-07-15",
  },
  {
    id: "CIT-DEF456",
    status: "shipped",
    total: 45000,
    items_count: 1,
    created_at: "2026-07-17",
  },
];

export default async function AccountPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  // Status badge colors
  const statusColor = (status: string) => {
    switch (status) {
      case "delivered": return "bg-success/10 text-success";
      case "shipped": return "bg-blue-500/10 text-blue-400";
      case "confirmed": return "bg-accent/10 text-accent";
      case "cancelled": return "bg-error/10 text-error";
      default: return "bg-surface text-text-muted";
    }
  };

  const statusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: dict.tracking.pending,
      confirmed: dict.tracking.confirmed,
      shipped: dict.tracking.shipped,
      delivered: dict.tracking.delivered,
      cancelled: dict.tracking.cancelled,
    };
    return labels[status] || status;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl text-text-primary mb-8">
        {dict.account.myOrders}
      </h1>

      {/* Auth placeholder — will show sign in / sign up when Supabase Auth is connected */}
      <div className="bg-surface rounded-xl border border-border p-6 mb-8">
        <p className="text-text-secondary text-sm mb-3">
          Sign in to view your order history and manage your account.
        </p>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-accent text-background rounded-lg font-semibold text-sm hover:bg-accent-hover transition-colors">
            {dict.nav.signIn}
          </button>
          <button className="px-5 py-2.5 border border-border text-text-primary rounded-lg font-semibold text-sm hover:bg-surface-hover transition-colors">
            {dict.nav.signUp}
          </button>
        </div>
      </div>

      {/* Order history (demo data) */}
      <h2 className="text-text-primary font-semibold text-lg mb-4">{dict.account.orderHistory}</h2>

      <div className="space-y-3">
        {MOCK_ORDERS.map((order) => (
          <Link
            key={order.id}
            href={`/${lang}/track?token=${order.id}`}
            className="flex items-center justify-between bg-surface rounded-xl border border-border
                       p-4 hover:border-accent/30 transition-colors group"
          >
            <div>
              <p className="text-accent font-medium group-hover:underline">{order.id}</p>
              <p className="text-text-muted text-xs mt-0.5">
                {order.created_at} · {order.items_count} {order.items_count === 1 ? "item" : "items"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(order.status)}`}>
                {statusLabel(order.status)}
              </span>
              <span className="text-text-primary font-semibold">{formatPrice(order.total)}</span>
              <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* Track as guest link */}
      <div className="mt-8 text-center">
        <Link href={`/${lang}/track`} className="text-accent text-sm hover:underline">
          {dict.account.trackOrder} &rarr;
        </Link>
      </div>
    </div>
  );
}
