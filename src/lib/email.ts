import { Resend } from "resend";

// HTML-escape user input to prevent injection in email templates
const esc = (s: string) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@collectorintown.com";
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "";

interface OrderNotification {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
  address: string;
  township: string;
  city: string;
}

export async function sendAdminOrderNotification(order: OrderNotification) {
  if (!resend || !ADMIN_EMAIL) return;

  const itemRows = order.items
    .map((i) => `${esc(i.name)} x${i.quantity} — ${i.price.toLocaleString()} Ks`)
    .join("\n");

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New Order ${esc(order.orderNumber)} — ${order.total.toLocaleString()} Ks`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px;">
          <h2 style="color: #7a5c1f;">New Order Received</h2>
          <p><strong>Order:</strong> ${esc(order.orderNumber)}</p>
          <p><strong>Payment:</strong> ${order.paymentMethod === "cod" ? "Cash on Delivery" : "Card"}</p>
          <hr style="border: none; border-top: 1px solid #e5e5e5;" />
          <h3>Customer</h3>
          <p>${esc(order.customerName)}<br/>${esc(order.customerEmail)}<br/>${esc(order.customerPhone)}</p>
          <h3>Delivery</h3>
          <p>${esc(order.address)}<br/>${esc(order.township)}, ${esc(order.city)}</p>
          <hr style="border: none; border-top: 1px solid #e5e5e5;" />
          <h3>Items</h3>
          <pre style="font-family: sans-serif; white-space: pre-wrap;">${itemRows}</pre>
          <hr style="border: none; border-top: 1px solid #e5e5e5;" />
          <p>Subtotal: ${order.subtotal.toLocaleString()} Ks</p>
          ${order.discount > 0 ? `<p>Discount: -${order.discount.toLocaleString()} Ks</p>` : ""}
          <p>Delivery: ${order.deliveryFee.toLocaleString()} Ks</p>
          <p style="font-size: 18px;"><strong>Total: ${order.total.toLocaleString()} Ks</strong></p>
        </div>
      `,
    });
  } catch {
    // Don't fail the order if email fails
  }
}
