import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { crmEnabled } from "@/app/lib/auth";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// The admin area only exists when the CRM is configured (DB + admin env).
// Otherwise every /admin route 404s — preserving the zero-DB template.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!crmEnabled) notFound();
  return (
    <div className="min-h-screen bg-paper font-body text-ink antialiased">
      {children}
    </div>
  );
}
