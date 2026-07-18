// Root page — redirects to the default locale (/en)
// The proxy.ts handles Accept-Language detection for new visitors,
// but this redirect catches any edge cases where / is hit directly
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/en");
}
