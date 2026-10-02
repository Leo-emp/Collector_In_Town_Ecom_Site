// Admin login page — redirects to regular sign-in
// Admin is determined by email, no separate login needed
import { redirect } from "next/navigation";

export default async function AdminLoginPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  redirect(`/${lang}/sign-in`);
}
