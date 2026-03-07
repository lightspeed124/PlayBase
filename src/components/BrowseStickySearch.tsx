"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useStickySearch } from "@/context/StickySearchContext";

/**
 * Wraps the Browse page search area. When the children scroll out of view,
 * a fixed search bar appears at the top (and the Navbar shrinks via context).
 */
export default function BrowseStickySearch({
  children,
  initialQuery = "",
  preserveParams = {},
}: {
  children: React.ReactNode;
  initialQuery?: string;
  preserveParams?: Record<string, string>;
}) {
  const router = useRouter();
  const { sticky, setSticky } = useStickySearch();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [keyword, setKeyword] = useState(initialQuery);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setSticky(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      setSticky(false);
    };
  }, [setSticky]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(preserveParams);
    if (keyword.trim()) params.set("q", keyword.trim());
    else params.delete("q");
    router.push(`/browse?${params.toString()}`);
  }

  return (
    <>
      {/* Fixed sticky bar — appears when in-page search scrolls out */}
      <div className={`fixed top-16 left-0 right-0 z-40 transition-all duration-300 ease-in-out ${
        sticky ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
      }`}>
        <div className="bg-white border-b border-gray-100 shadow-sm px-4 py-3">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-5 py-2 gap-3">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Search bounce houses, water slides…"
                  className="flex-1 outline-none text-gray-800 text-sm bg-transparent placeholder-gray-400"
                />
                <button
                  type="submit"
                  className="bg-brand-pink hover:bg-brand-pink-dark text-white rounded-full w-8 h-8 flex items-center justify-center shrink-0 transition-colors"
                  aria-label="Search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Sentinel — in-page search area */}
      <div ref={sentinelRef}>
        {children}
      </div>
    </>
  );
}
