import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Business Dashboard - Timer.mn",
  description: "Manage your business, staff, and appointments",
};

export default function B2BLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* B2B Sidebar + Topbar */}
      <aside>...</aside>
      <main>{children}</main>
    </div>
  );
}
