// Admin Orders page — order list with status management
import { notFound } from "next/navigation";
import { hasLocale } from "../../dictionaries";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "Orders — Admin — Collector In Town" };

const ORDERS = [
  { id: "CIT-XK91M", customer: "Aung Kyaw", email: "aung@email.com", items: 2, total: 97000, status: "confirmed", zone: "Yangon", date: "2026-07-18" },
  { id: "CIT-PL32N", customer: "Thiri Htun", email: "thiri@email.com", items: 1, total: 45000, status: "shipped", zone: "Mandalay", date: "2026-07-17" },
  { id: "CIT-QR78A", customer: "Min Thet", email: "min@email.com", items: 3, total: 125000, status: "delivered", zone: "Yangon", date: "2026-07-16" },
  { id: "CIT-AB56C", customer: "Nay Win", email: "nay@email.com", items: 1, total: 52000, status: "pending", zone: "Naypyidaw", date: "2026-07-18" },
  { id: "CIT-UV34D", customer: "Su Myat", email: "su@email.com", items: 2, total: 67000, status: "confirmed", zone: "Other Regions", date: "2026-07-17" },
  { id: "CIT-GH90E", customer: "Kyaw Zin", email: "kyaw@email.com", items: 1, total: 35000, status: "cancelled", zone: "Yangon", date: "2026-07-14" },
];

export default async function AdminOrdersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const statusColor = (s: string) => {
    switch (s) {
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
      <h1 className="font-[family-name:var(--font-cinzel)] text-2xl text-text-primary mb-6">Orders</h1>

      {/* Stats */}
      <div className="flex gap-4 mb-6 flex-wrap">
        {["pending", "confirmed", "shipped", "delivered", "cancelled"].map((s) => (
          <div key={s} className="bg-surface rounded-lg border border-border px-4 py-2 text-sm">
            <span className="text-text-muted capitalize">{s}: </span>
            <span className="text-text-primary font-medium">{ORDERS.filter(o => o.status === s).length}</span>
          </div>
        ))}
      </div>

      {/* Orders table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-hover/30">
                <th className="text-left text-text-muted font-medium px-5 py-3">Order</th>
                <th className="text-left text-text-muted font-medium px-5 py-3">Customer</th>
                <th className="text-left text-text-muted font-medium px-5 py-3">Zone</th>
                <th className="text-center text-text-muted font-medium px-5 py-3">Items</th>
                <th className="text-center text-text-muted font-medium px-5 py-3">Status</th>
                <th className="text-right text-text-muted font-medium px-5 py-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {ORDERS.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0 hover:bg-surface-hover/50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-accent font-medium">{order.id}</p>
                    <p className="text-text-muted text-xs">{order.date}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-text-primary">{order.customer}</p>
                    <p className="text-text-muted text-xs">{order.email}</p>
                  </td>
                  <td className="px-5 py-3 text-text-secondary">{order.zone}</td>
                  <td className="px-5 py-3 text-center text-text-secondary">{order.items}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-text-primary font-medium">{formatPrice(order.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
