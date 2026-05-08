import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Timer.mn - Find & Book Appointments",
  description: "Discover and book appointments with hair salons, beauty spas, dental clinics, and yoga studios in Mongolia",
};

export default function B2CLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* B2C Navigation */}
      <nav className="border-b">...</nav>
      <main>{children}</main>
      {/* B2C Footer */}
      <footer>...</footer>
    </div>
  );
}
