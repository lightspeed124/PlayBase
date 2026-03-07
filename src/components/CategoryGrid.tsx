import Link from "next/link";
import Image from "next/image";
import type { CategorySummary } from "@/types";
import { CATEGORY_DISPLAY_ORDER } from "@/lib/data";

// ─── Static catalog per category ──────────────────────────────────────────────

const CATEGORY_META: Record<string, { image: string; description: string }> = {
  "Bounce Houses": {
    image: "/Bounce Houses.webp",
    description: "Classic inflatable castles for endless jumping fun",
  },
  "Bounce & Slide Combo": {
    image: "/Bounce & Slide Combo.webp",
    description: "Bounce, slide, and climb all in one unit",
  },
  "Water Slides": {
    image: "/Water Slides.webp",
    description: "Beat the heat with thrilling wet-and-wild slides",
  },
  "Obstacle Courses": {
    image: "/Obstacle Courses.webp",
    description: "Race through tunnels, climbs, and pop-up challenges",
  },
  "Interactive Games": {
    image: "/Interactive Games.webp",
    description: "Carnival-style games and attractions for all ages",
  },
  "Sports Games": {
    image: "/Sports Games.webp",
    description: "Giant basketball, football, and competitive fun",
  },
  "Toddler Units": {
    image: "/Toddler Units.webp",
    description: "Soft, safe bouncing designed for little ones",
  },
  "Water Games": {
    image: "/Water Games.webp",
    description: "Dunk tanks and water games — a guaranteed crowd-pleaser",
  },
  "Concessions": {
    image: "/Concessions.webp",
    description: "Popcorn, cotton candy, and snow cones for the party",
  },
  "Tables & Chairs": {
    image: "/Tables & Chairs.webp",
    description: "Complete your setup with seating for all guests",
  },
  "Tents": {
    image: "/Tents.webp",
    description: "Shade and shelter for any outdoor event",
  },
};

const DISPLAY_ORDER = CATEGORY_DISPLAY_ORDER;

// ─── Component ─────────────────────────────────────────────────────────────────

interface Props {
  categories: CategorySummary[];
  totalCount?: number;
}

export default function CategoryGrid({ categories, totalCount }: Props) {
  // Build a lookup map from the live DB data
  const dbMap = new Map(categories.map((c) => [c.category_name, c]));

  const tiles = DISPLAY_ORDER
    .map((name) => {
      const db = dbMap.get(name);
      const meta = CATEGORY_META[name];
      if (!db || !meta) return null;
      return { name, meta, db };
    })
    .filter(Boolean) as { name: string; meta: { image: string; description: string }; db: CategorySummary }[];

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Browse by Category</h2>
        <Link
          href="/browse"
          className="text-sm text-gray-400 hover:text-gray-700 font-medium transition-colors"
        >
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {tiles.map(({ name, meta, db }) => (
          <Link
            key={name}
            href={`/browse?category=${encodeURIComponent(name)}`}
            className="group block"
          >
            {/* Image tile */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-200">
              {meta.image !== "PLACEHOLDER" ? (
                <Image
                  src={meta.image}
                  alt={name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  style={{ filter: "saturate(1.08) contrast(1.04) brightness(1.02)" }}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl bg-brand-blue-subtle">
                  🎪
                </div>
              )}
              {/* Gradient for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent pointer-events-none" />
              {/* Listing count badge */}
              <div className="absolute top-3 right-3">
                <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {db.listing_count}
                </span>
              </div>
              {/* Text overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="text-white font-bold text-sm leading-tight drop-shadow">
                  {name}
                </h3>
                <p className="text-white/80 text-xs mt-0.5 leading-snug drop-shadow line-clamp-2">
                  {meta.description}
                </p>
              </div>
            </div>
          </Link>
        ))}

        {/* 12th card — fills the empty grid spot */}
        <Link href="/browse" className="group block">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-brand-blue-subtle flex flex-col items-center justify-center gap-2 border-2 border-dashed border-brand-blue/20 group-hover:border-brand-blue/40 group-hover:bg-brand-blue/10 transition-all duration-200">
            <div className="w-12 h-12 rounded-full bg-brand-blue/10 group-hover:bg-brand-blue/20 flex items-center justify-center transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-brand-blue">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </div>
            <span className="text-sm font-bold text-brand-blue">Explore All</span>
            <span className="text-xs text-gray-400">{totalCount}+ rentals</span>
          </div>
        </Link>
      </div>
    </section>
  );
}
