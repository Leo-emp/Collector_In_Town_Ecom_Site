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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://www.collectorintown.com";

// ─── Customer order confirmation email ──────────────────
export async function sendCustomerOrderConfirmation(order: OrderNotification & { trackingToken: string }) {
  if (!resend) return;

  const itemRows = order.items
    .map((i) => `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${esc(i.name)}</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; text-align: center;">x${i.quantity}</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; text-align: right;">${(i.price * i.quantity).toLocaleString()} Ks</td>
      </tr>
    `)
    .join("");

  const trackUrl = `${SITE_URL}/en/track?token=${encodeURIComponent(order.trackingToken)}`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: order.customerEmail,
      subject: `Order Confirmed — ${esc(order.orderNumber)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #333;">
          <h2 style="color: #7a5c1f; margin-bottom: 4px;">Thank you for your order!</h2>
          <p style="color: #666; margin-top: 0;">Hi ${esc(order.customerName)}, we've received your order.</p>

          <div style="background: #faf8f5; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0 0 4px;"><strong>Order Number:</strong> ${esc(order.orderNumber)}</p>
            <p style="margin: 0;"><strong>Payment:</strong> ${order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod === "kbzpay" ? "KBZ Pay" : "Card"}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="border-bottom: 2px solid #e5e5e5;">
                <th style="text-align: left; padding: 8px 0;">Item</th>
                <th style="text-align: center; padding: 8px 0;">Qty</th>
                <th style="text-align: right; padding: 8px 0;">Price</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>

          <div style="margin-top: 16px; font-size: 14px;">
            <p style="margin: 4px 0;">Subtotal: ${order.subtotal.toLocaleString()} Ks</p>
            ${order.discount > 0 ? `<p style="margin: 4px 0; color: #16a34a;">Discount: -${order.discount.toLocaleString()} Ks</p>` : ""}
            <p style="margin: 4px 0;">Delivery: ${order.deliveryFee.toLocaleString()} Ks</p>
            <p style="margin: 8px 0 0; font-size: 18px;"><strong>Total: ${order.total.toLocaleString()} Ks</strong></p>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;" />

          <h3 style="margin-bottom: 4px;">Delivery Address</h3>
          <p style="color: #666; margin-top: 0;">${esc(order.address)}<br/>${esc(order.township)}, ${esc(order.city)}</p>

          <div style="text-align: center; margin: 24px 0;">
            <a href="${trackUrl}" style="display: inline-block; background: #7a5c1f; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Track Your Order
            </a>
          </div>

          <p style="color: #999; font-size: 12px; text-align: center;">
            Collector In Town — Myanmar's premier diecast model car store
          </p>
        </div>
      `,
    });
  } catch {
    // Don't fail the order if email fails
  }
}

// ─── Customer tracking number notification ──────────────
export async function sendTrackingNumberEmail(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  trackingNumber: string,
  trackingToken: string | null,
) {
  if (!resend) return;

  const trackUrl = trackingToken
    ? `${SITE_URL}/en/track?token=${encodeURIComponent(trackingToken)}`
    : null;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `Your Order ${esc(orderNumber)} Has Been Shipped`,
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #333;">
          <h2 style="color: #7a5c1f;">Your order is on its way!</h2>
          <p>Hi ${esc(customerName)}, your order <strong>${esc(orderNumber)}</strong> has been shipped.</p>

          <div style="background: #faf8f5; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0 0 4px;"><strong>Tracking Number:</strong></p>
            <p style="margin: 0; font-size: 18px; font-weight: bold; color: #7a5c1f;">${esc(trackingNumber)}</p>
          </div>

          ${trackUrl ? `
          <div style="text-align: center; margin: 24px 0;">
            <a href="${trackUrl}" style="display: inline-block; background: #7a5c1f; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Track Your Order
            </a>
          </div>
          ` : ""}

          <p style="color: #999; font-size: 12px; text-align: center;">
            Collector In Town — Myanmar's premier diecast model car store
          </p>
        </div>
      `,
    });
  } catch {
    // Don't fail the order update if email fails
  }
}

// ─── Customer order confirmed email ────────────────────
// Sent when admin confirms the order (status → confirmed)
export async function sendOrderConfirmedEmail(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  trackingToken: string | null,
) {
  if (!resend) return;

  const trackUrl = trackingToken
    ? `${SITE_URL}/en/track?token=${encodeURIComponent(trackingToken)}`
    : null;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `Order ${esc(orderNumber)} Confirmed`,
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #333;">
          <h2 style="color: #7a5c1f;">Your order has been confirmed</h2>
          <p>Hi ${esc(customerName)}, great news! Your order <strong>${esc(orderNumber)}</strong> has been confirmed and is being prepared for delivery.</p>

          <div style="background: #f0fdf4; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <p style="margin: 0; color: #16a34a; font-weight: 600;">Order Confirmed</p>
            <p style="margin: 4px 0 0; color: #666;">We'll notify you again once your order has been shipped.</p>
          </div>

          ${trackUrl ? `
          <div style="text-align: center; margin: 24px 0;">
            <a href="${trackUrl}" style="display: inline-block; background: #7a5c1f; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Track Your Order
            </a>
          </div>
          ` : ""}

          <p style="color: #999; font-size: 12px; text-align: center;">
            Collector In Town — Myanmar's premier diecast model car store
          </p>
        </div>
      `,
    });
  } catch {
    // Don't fail the order update if email fails
  }
}

// ─── Customer order delivered email ────────────────────
// Sent when admin marks order as done (status → done)
export async function sendOrderDeliveredEmail(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
) {
  if (!resend) return;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `Order ${esc(orderNumber)} Delivered`,
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #333;">
          <h2 style="color: #7a5c1f;">Your order has been delivered</h2>
          <p>Hi ${esc(customerName)}, your order <strong>${esc(orderNumber)}</strong> has been delivered successfully.</p>

          <div style="background: #f0fdf4; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <p style="margin: 0; color: #16a34a; font-weight: 600;">Delivered</p>
            <p style="margin: 4px 0 0; color: #666;">Thank you for shopping with us! We hope you enjoy your new diecast models.</p>
          </div>

          <div style="text-align: center; margin: 24px 0;">
            <a href="${SITE_URL}/en/products/new-arrivals" style="display: inline-block; background: #7a5c1f; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Browse More Models
            </a>
          </div>

          <p style="color: #999; font-size: 12px; text-align: center;">
            Collector In Town — Myanmar's premier diecast model car store
          </p>
        </div>
      `,
    });
  } catch {
    // Don't fail the order update if email fails
  }
}

// ─── Customer order cancelled email ────────────────────
// Sent when admin cancels the order (status → cancelled)
export async function sendOrderCancelledEmail(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
) {
  if (!resend) return;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `Order ${esc(orderNumber)} Cancelled`,
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #333;">
          <h2 style="color: #7a5c1f;">Your order has been cancelled</h2>
          <p>Hi ${esc(customerName)}, your order <strong>${esc(orderNumber)}</strong> has been cancelled.</p>

          <div style="background: #fef2f2; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p style="margin: 0; color: #dc2626; font-weight: 600;">Order Cancelled</p>
            <p style="margin: 4px 0 0; color: #666;">If you paid by card, your refund will be processed within 5-10 business days. If you have any questions, please contact us.</p>
          </div>

          <div style="text-align: center; margin: 24px 0;">
            <a href="${SITE_URL}/en" style="display: inline-block; background: #7a5c1f; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Visit Our Store
            </a>
          </div>

          <p style="color: #999; font-size: 12px; text-align: center;">
            Collector In Town — Myanmar's premier diecast model car store
          </p>
        </div>
      `,
    });
  } catch {
    // Don't fail the order update if email fails
  }
}

// ─── Admin order notification ───────────────────────────
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
          <p><strong>Payment:</strong> ${order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod === "kbzpay" ? "KBZ Pay" : "Card"}</p>
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
