// Admin Customers page — customer list with order counts
import { notFound } from "next/navigation";
import { hasLocale } from "../../dictionaries";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "Customers — Admin — Collector In Town" };

const CUSTOMERS = [
  { id: "1", name: "Aung Kyaw", email: "aung@email.com", phone: "09-111-222-333", orders: 5, total_spent: 425000, joined: "2026-06-01" },
  { id: "2", name: "Thiri Htun", email: "thiri@email.com", phone: "09-222-333-444", orders: 3, total_spent: 195000, joined: "2026-06-15" },
  { id: "3", name: "Min Thet", email: "min@email.com", phone: "09-333-444-555", orders: 8, total_spent: 680000, joined: "2026-05-20" },
  { id: "4", name: "Nay Win", email: "nay@email.com", phone: "09-444-555-666", orders: 1, total_spent: 52000, joined: "2026-07-18" },
  { id: "5", name: "Su Myat", email: "su@email.com", phone: "09-555-666-777", orders: 2, total_spent: 97000, joined: "2026-07-10" },
];

export default async function AdminCustomersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    <div>
      <h1 className="font-[family-name:var(--font-cinzel)] text-2xl text-text-primary mb-6">Customers</h1>

      <p className="text-text-muted text-sm mb-6">{CUSTOMERS.length} registered customers</p>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-hover/30">
                <th className="text-left text-text-muted font-medium px-5 py-3">Customer</th>
                <th className="text-left text-text-muted font-medium px-5 py-3">Phone</th>
                <th className="text-center text-text-muted font-medium px-5 py-3">Orders</th>
                <th className="text-right text-text-muted font-medium px-5 py-3">Total Spent</th>
                <th className="text-right text-text-muted font-medium px-5 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {CUSTOMERS.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-surface-hover/50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-text-primary font-medium">{c.name}</p>
                    <p className="text-text-muted text-xs">{c.email}</p>
                  </td>
                  <td className="px-5 py-3 text-text-secondary">{c.phone}</td>
                  <td className="px-5 py-3 text-center text-text-primary">{c.orders}</td>
                  <td className="px-5 py-3 text-right text-accent font-medium">{formatPrice(c.total_spent)}</td>
                  <td className="px-5 py-3 text-right text-text-muted">{c.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
