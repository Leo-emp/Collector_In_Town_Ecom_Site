import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Security headers applied to all routes
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        // Prevent clickjacking — block iframe embedding entirely
        { key: "X-Frame-Options", value: "DENY" },
        // Stop browsers from MIME-sniffing — serve declared content type only
        { key: "X-Content-Type-Options", value: "nosniff" },
        // Control referrer info sent to external sites
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        // Speed up DNS resolution for external resources
        { key: "X-DNS-Prefetch-Control", value: "on" },
        // Force HTTPS for 2 years with subdomains + preload list
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
        // Block access to device APIs the site doesn't need
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
        },
        // CSP — restricts what scripts/styles/images can load
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com",
            "connect-src 'self' https://*.turso.io https://*.vercel-storage.com https://api.resend.com",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "object-src 'none'",
          ].join("; "),
        },
        // Prevent XSS — opt into browser XSS filter
        { key: "X-XSS-Protection", value: "1; mode=block" },
        // Prevent cross-origin info leaks
        { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
      ],
    },
  ],
};

export default nextConfig;
