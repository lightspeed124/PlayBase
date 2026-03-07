import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { CityProvider } from "@/context/CityContext";
import { StickySearchProvider } from "@/context/StickySearchContext";

export const metadata: Metadata = {
  title: "JumpFun — Book Bounce Houses & Party Rentals",
  description:
    "Find and book bounce houses, water slides, combos, and party rentals from top-rated local companies. Instant booking, transparent pricing, delivered to your door.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 antialiased">
        <StickySearchProvider>
          <CityProvider>
            <Navbar />
            <main>{children}</main>
          </CityProvider>
        </StickySearchProvider>
        <Footer />
        <ScrollToTop />
      </body>
    </html>
  );
}
