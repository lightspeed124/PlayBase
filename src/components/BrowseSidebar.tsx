"use client";

import { useState } from "react";
import { SlidersHorizontal, ChevronUp, ChevronDown } from "lucide-react";

export default function BrowseSidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <aside className="lg:w-60 shrink-0 lg:self-start lg:sticky lg:top-6">
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="lg:hidden w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 mb-3 transition-colors"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Sidebar content */}
      <div className={`${open ? "block" : "hidden"} lg:block`}>
        <div className="lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto space-y-7 pr-1">
          {children}
        </div>
      </div>
    </aside>
  );
}
