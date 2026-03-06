"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import NavCityPicker from "@/components/NavCityPicker";
import { useStickySearch } from "@/context/StickySearchContext";

export default function Navbar() {
  const { sticky } = useStickySearch();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center transition-all duration-300 ${sticky ? "h-[21px]" : "h-16"}`}>
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="JumpFun"
              width={sticky ? 73 : 220}
              height={sticky ? 26 : 78}
              priority
              className="transition-all duration-300"
            />
          </Link>

          {!sticky && (
            <>
              {/* Desktop nav */}
              <div className="hidden md:flex items-center gap-6">
                <Link href="/browse" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
                  Browse All
                </Link>
                <NavCityPicker />
                <Link href="/plan" className="text-sm font-semibold text-white bg-brand-blue hover:bg-brand-blue-dark px-4 py-1.5 rounded-full transition-colors">
                  Get Matched
                </Link>
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen((o) => !o)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile dropdown */}
      {!sticky && mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          <Link href="/browse" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-gray-700 py-2">
            Browse All
          </Link>
          <Link href="/plan" onClick={() => setMobileOpen(false)} className="block text-sm font-semibold text-white bg-brand-blue px-4 py-2.5 rounded-xl text-center">
            Get Matched
          </Link>
        </div>
      )}
    </nav>
  );
}
