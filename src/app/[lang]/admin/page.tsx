// Admin Dashboard — overview with key metrics and recent activity
// Will pull real data from Supabase when connected
import { notFound } from "next/navigation";
import { hasLocale } from "../dictionaries";
import { formatPrice } from "@/lib/format";

export const metadata = {
  title: "Admin Dashboard — Collector In Town",
};

// Placeholder analytics data
const STATS = [
  { label: "Total Revenue", value: "1,250,000 Ks", change: "+12%", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { label: "Orders", value: "47", change: "+8%", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
  { label: "Products", value: "86", change: "+3", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
  { label: "Customers", value: "312", change: "+24", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
];

// Placeholder recent orders
const RECENT_ORDERS = [
  { id: "CIT-XK91M", customer: "Aung Kyaw", items: 2, total: 97000, status: "confirmed", date: "2026-07-18" },
  { id: "CIT-PL32N", customer: "Thiri Htun", items: 1, total: 45000, status: "shipped", date: "2026-07-17" },
  { id: "CIT-QR78A", customer: "Min Thet", items: 3, total: 125000, status: "delivered", date: "2026-07-16" },
  { id: "CIT-AB56C", customer: "Nay Win", items: 1, total: 52000, status: "pending", date: "2026-07-18" },
  { id: "CIT-UV34D", customer: "Su Myat", items: 2, total: 67000, status: "confirmed", date: "2026-07-17" },
];

// Low stock alerts
const LOW_STOCK = [
  { name: "Mitsubishi Lancer Evolution III", brand: "Inno64", stock: 6 },
  { name: "Porsche 911 GT3 RS", brand: "Mini GT", stock: 8 },
  { name: "Toyota Supra A80 TRD", brand: "Pop Race", stock: 0 },
];

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const statusColor = (status: string) => {
    switch (status) {
      case "delivered": return "bg-success/10 text-success";
      case "shipped": return "bg-blue-500/10 text-blue-400";
      case "confirmed": return "bg-accent/10 text-accent";
      case "pending": return "bg-orange-500/10 text-orange-400";
      case "cancelled": return "bg-error/10 text-error";
      default: return "bg-surface text-text-muted";
    }
  };

  return (
    <div>
      <h1 className="font-[family-name:var(--font-playfair)] text-2xl text-text-primary mb-6">
        Dashboard
      </h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-surface rounded-xl border border-border p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-text-muted text-sm">{stat.label}</p>
                <p className="text-text-primary text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className="p-2 bg-accent/10 rounded-lg">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                </svg>
              </div>
            </div>
            <p className="text-success text-xs mt-2">{stat.change} this week</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders — takes 2 columns */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-border">
          <div className="p-5 border-b border-border">
            <h2 className="text-text-primary font-semibold">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-text-muted font-medium px-5 py-3">Order</th>
                  <th className="text-left text-text-muted font-medium px-5 py-3">Customer</th>
                  <th className="text-left text-text-muted font-medium px-5 py-3">Status</th>
                  <th className="text-right text-text-muted font-medium px-5 py-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_ORDERS.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-surface-hover transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-accent font-medium">{order.id}</p>
                      <p className="text-text-muted text-xs">{order.date}</p>
                    </td>
                    <td className="px-5 py-3 text-text-secondary">{order.customer}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-text-primary font-medium">
                      {formatPrice(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low stock alerts — takes 1 column */}
        <div className="bg-surface rounded-xl border border-border">
          <div className="p-5 border-b border-border">
            <h2 className="text-text-primary font-semibold">Low Stock Alerts</h2>
          </div>
          <div className="p-5 space-y-4">
            {LOW_STOCK.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div>
                  <p className="text-text-primary text-sm font-medium">{item.name}</p>
                  <p className="text-text-muted text-xs">{item.brand}</p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full
                  ${item.stock === 0
                    ? "bg-error/10 text-error"
                    : item.stock <= 5
                      ? "bg-orange-500/10 text-orange-400"
                      : "bg-accent/10 text-accent"
                  }`}
                >
                  {item.stock === 0 ? "OUT" : item.stock}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
