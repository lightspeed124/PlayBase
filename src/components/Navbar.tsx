"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import NavCityPicker from "@/components/NavCityPicker";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.svg"
              alt="JumpFun"
              width={220}
              height={78}
              priority
              className="max-w-[140px] sm:max-w-none h-auto"
            />
            <span className="text-[11px] sm:text-[13px] text-gray-400 font-medium border-l border-gray-200 pl-2 sm:pl-2.5">
              Inflatable Rentals
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <NavCityPicker className="hidden md:flex" />
            <Link href="/browse" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Browse All
            </Link>
            <Link href="/plan" className="text-sm font-semibold text-white bg-brand-blue hover:bg-brand-blue-dark px-4 py-1.5 rounded-full transition-colors">
              Help Me Choose
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
        </div>
      </div>

      {/* Mobile dropdown — glass card */}
      {mobileOpen && (
        <div className="md:hidden absolute left-0 right-0 top-full z-40">
          <div className="mx-3 mt-1 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-lg overflow-hidden">
            <div className="divide-y divide-gray-100/80">
              <NavCityPicker className="w-full px-4 py-3" />
              <Link
                href="/browse"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-white/60 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                Browse All Rentals
              </Link>
              <Link
                href="/plan"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-brand-blue hover:bg-white/60 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-brand-blue">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
                </svg>
                Help Me Choose
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
