// Wrapper that hides Footer on admin pages
"use client";

import { usePathname } from "next/navigation";

export function FooterWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.includes("/admin")) return null;
  return <>{children}</>;
}
