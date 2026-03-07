"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCity } from "@/context/CityContext";
import { fetchCitySuggestions, CitySuggestion } from "@/lib/geo";

const HERO_IMAGES = [
  { src: "/Bounce Houses.webp", label: "Bounce Houses", headline: "Bounce House" },
  { src: "/Bounce & Slide Combo.webp", label: "Bounce & Slide Combo", headline: "Slide Combo" },
  { src: "/Water Slides.webp", label: "Water Slides", headline: "Water Slide" },
  { src: "/Obstacle Courses.webp", label: "Obstacle Courses", headline: "Obstacle Course" },
  { src: "/Interactive Games.webp", label: "Interactive Games", headline: "Party Game" },
  { src: "/Sports Games.webp", label: "Sports Games", headline: "Sports Game" },
  { src: "/Toddler Units.webp", label: "Toddler Units", headline: "Toddler Unit" },
  { src: "/Water Games.webp", label: "Water Games", headline: "Water Game" },
  { src: "/Concessions.webp", label: "Concessions", headline: "Concession Stand" },
  { src: "/Tables & Chairs.webp", label: "Tables & Chairs", headline: "Party Setup" },
  { src: "/Tents.webp", label: "Tents", headline: "Party Tent" },
];

export default function HomeHero({ totalListings }: { totalListings: number }) {
  const router = useRouter();
  const { city, loading: cityLoading, setCity } = useCity();
  const [current, setCurrent] = useState(0);
  const [textIndex, setTextIndex] = useState(0);

  // City editing state
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cycle hero images — background changes first, text follows 1.5s later
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => setTextIndex(current), 1500);
    return () => clearTimeout(delay);
  }, [current]);

  // Focus input when editing
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  // Debounced city suggestions
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!inputValue || inputValue.length < 2) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      const results = await fetchCitySuggestions(inputValue);
      setSuggestions(results);
    }, 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [inputValue]);

  // Click outside to close editing
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setEditing(false);
        setSuggestions([]);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function startEditing() {
    setInputValue(city === "your area" ? "" : city);
    setEditing(true);
  }

  function commit(newCity: string) {
    if (!newCity.trim()) return;
    setCity(newCity.trim());
    setEditing(false);
    setSuggestions([]);
    router.push(`/browse?city=${encodeURIComponent(newCity.trim())}`);
  }

  function selectSuggestion(s: CitySuggestion) { commit(s.display); }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      commit(suggestions.length > 0 ? suggestions[0].display : inputValue);
    } else if (e.key === "Escape") {
      setEditing(false);
      setSuggestions([]);
    }
  }

  return (
    <section className="relative">
      {/* ── Top: text content on gradient ─────────────────────────────── */}
      <div className="relative bg-gradient-to-b from-white via-brand-blue-subtle/40 to-brand-blue-subtle pt-8 pb-10 sm:pt-10 sm:pb-12 px-6 sm:px-8 text-center">
        {/* Use-case strip */}
        <p className="text-gray-400 text-[10px] sm:text-[11px] font-bold tracking-[0.22em] uppercase mb-4 sm:mb-5">
          Birthday Parties &nbsp;·&nbsp; School &amp; Church Events &nbsp;·&nbsp; Corporate Outings &nbsp;·&nbsp; Festivals &amp; Carnivals
        </p>

        {/* Headline with rotating keyword */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-extrabold text-gray-900 leading-[1.15] max-w-3xl mx-auto">
          Find Your Perfect<br />
          <span className="text-brand-blue">
            <span className="relative inline-block">
              {/* Invisible spacer — keeps container sized to the widest keyword */}
              <span className="invisible whitespace-nowrap" aria-hidden="true">Concession Stand</span>
              {HERO_IMAGES.map((img, i) => (
                <span
                  key={img.headline}
                  className={`whitespace-nowrap absolute inset-0 transition-opacity duration-1000 ${
                    i === textIndex
                      ? "opacity-100"
                      : "opacity-0 pointer-events-none"
                  }`}
                  style={{ transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)" }}
                  aria-hidden={i !== textIndex}
                >
                  {img.headline}
                </span>
              ))}
            </span>
          </span>
        </h1>

        {/* Rental count + editable city */}
        <div ref={containerRef} className="relative mt-4 sm:mt-5">
          <p className="text-gray-500 text-base sm:text-lg font-medium flex items-center justify-center gap-1.5 flex-wrap">
            <span className="text-gray-900 font-bold">{totalListings.toLocaleString()}+ rentals</span>
            <span>available near</span>
            {editing ? (
              <span className="relative inline-block">
                <span className="inline-flex items-center border-2 border-brand-blue rounded-lg px-3 py-0.5">
                  <input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter city…"
                    className="outline-none text-brand-blue font-bold text-base sm:text-lg bg-transparent w-36 placeholder-brand-blue/40"
                  />
                </span>
                {suggestions.length > 0 && (
                  <ul className="absolute left-0 top-full mt-1 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    {suggestions.map((s, i) => (
                      <li
                        key={i}
                        onMouseDown={() => selectSuggestion(s)}
                        className="px-4 py-3 hover:bg-brand-blue-subtle cursor-pointer text-left"
                      >
                        <div className="text-sm font-semibold text-gray-900">{s.name}</div>
                        {s.state && (
                          <div className="text-xs text-gray-400">
                            {s.state}{s.country && s.country !== "United States of America" ? `, ${s.country}` : ""}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </span>
            ) : (
              <button
                onClick={startEditing}
                disabled={cityLoading}
                title="Click to change city"
                className="inline-flex items-center gap-1 text-brand-blue font-bold text-base sm:text-lg border-b-2 border-dashed border-brand-blue/40 hover:border-brand-blue transition-colors disabled:opacity-40 pb-0.5 cursor-pointer"
              >
                {cityLoading ? (
                  <span className="inline-block w-24 h-5 rounded bg-gray-200 animate-pulse" />
                ) : (
                  <>
                    {city}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                      <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L3.88 9.648a.75.75 0 0 0-.196.37l-.66 3a.75.75 0 0 0 .892.892l3-.66a.75.75 0 0 0 .37-.196l7.135-7.133a1.75 1.75 0 0 0 0-2.475l-.933-.933Z" />
                    </svg>
                  </>
                )}
              </button>
            )}
          </p>
        </div>

        {/* Dual CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 sm:mt-7">
          <Link
            href="/browse"
            className="bg-brand-blue text-white font-bold text-sm sm:text-base px-7 sm:px-8 py-3 sm:py-3.5 rounded-full shadow-lg hover:shadow-xl hover:bg-brand-blue-dark hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Browse All Rentals
          </Link>
          <Link
            href="/plan"
            className="inline-flex items-center gap-2 bg-white text-gray-700 font-semibold text-sm sm:text-base px-7 sm:px-8 py-3 sm:py-3.5 rounded-full border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 active:scale-[0.98] transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-brand-blue">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
            </svg>
            Help Me Choose
          </Link>
        </div>
      </div>

      {/* ── Bottom: crossfading image showcase ────────────────────────── */}
      <div className="relative h-[38vh] min-h-[260px] max-h-[380px] overflow-hidden">
        {HERO_IMAGES.map((img, i) => (
          <Image
            key={img.src}
            src={img.src}
            alt={img.label}
            fill
            className={`object-cover object-center transition-opacity duration-[1500ms] ease-in-out ${
              i === current ? "opacity-100" : "opacity-0"
            }`}
            priority={i === 0}
            sizes="100vw"
          />
        ))}

        {/* Soft top-edge fade blending into the gradient above */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-brand-blue-subtle to-transparent pointer-events-none" />

        {/* Category indicator dots + label */}
        <div className="absolute inset-x-0 bottom-0 pb-4 pt-10 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex flex-col items-center gap-2">
            <span className="text-white/80 text-xs font-medium drop-shadow transition-all duration-500">
              {HERO_IMAGES[current].label}
            </span>
            <div className="flex gap-1.5">
              {HERO_IMAGES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === current
                      ? "w-6 h-1.5 bg-white"
                      : "w-1.5 h-1.5 bg-white/40 hover:bg-white/60"
                  }`}
                  aria-label={`Show ${HERO_IMAGES[i].label}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
