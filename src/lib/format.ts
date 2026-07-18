// Formats integer MMK amount to "XX,XXX Ks" display string
// Used everywhere prices are shown — product cards, cart, checkout, admin
export function formatPrice(amount: number): string {
  return `${amount.toLocaleString("en-US")} Ks`;
}

// Formats ISO date string to "Jul 19, 2026" display format
// Used in order history, admin order details
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Generates URL-friendly slug from product name
// Used when admin creates a new product
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
