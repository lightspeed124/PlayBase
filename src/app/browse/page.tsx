import Link from "next/link";
import {
  rentalItems,
  companies,
  getCompanyById,
  getCompaniesByLocation,
} from "@/lib/data";
import ItemCard from "@/components/ItemCard";
import { Category } from "@/types";

interface SearchParams {
  category?: string;
  q?: string;
  city?: string;
  date?: string;
  minPrice?: string;
  maxPrice?: string;
  company?: string;
  theme?: string;
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const {
    category,
    q,
    city,
    date,
    minPrice,
    maxPrice,
    company: companyFilter,
    theme,
  } = params;

  // --- DoorDash-style location gate ---
  // Determine which companies serve the requested city/zip.
  const servingCompanies = city ? getCompaniesByLocation(city) : companies;
  const servingCompanyIds = new Set(servingCompanies.map((c) => c.id));
  const noServiceArea = city ? servingCompanies.length === 0 : false;

  // Start from items whose company serves the requested location
  let filtered = rentalItems.filter((i) => servingCompanyIds.has(i.companyId));

  // Keyword search
  if (q) {
    const query = q.toLowerCase();
    filtered = filtered.filter(
      (i) =>
        i.name.toLowerCase().includes(query) ||
        i.description.toLowerCase().includes(query) ||
        i.themes.some((t) => t.toLowerCase().includes(query)) ||
        i.category.toLowerCase().includes(query) ||
        i.colors.some((c) => c.toLowerCase().includes(query))
    );
  }

  if (category) {
    filtered = filtered.filter((i) => i.category === category);
  }

  if (companyFilter) {
    filtered = filtered.filter((i) => i.companyId === companyFilter);
  }

  if (theme) {
    filtered = filtered.filter((i) =>
      i.themes.some((t) => t.toLowerCase() === theme.toLowerCase())
    );
  }

  if (minPrice) {
    filtered = filtered.filter((i) => i.price >= parseInt(minPrice));
  }
  if (maxPrice) {
    filtered = filtered.filter((i) => i.price <= parseInt(maxPrice));
  }

  const allCategories: Category[] = [
    "Bounce Houses",
    "Water Slides",
    "Combos",
    "Obstacle Courses",
    "Games",
    "Concessions",
    "Tents",
    "Tables & Chairs",
    "Accessories",
  ];

  const allThemes = Array.from(
    new Set(rentalItems.flatMap((i) => i.themes))
  ).sort();

  // Helper: build a URL preserving the current city/date context
  function buildUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    const current: Record<string, string | undefined> = {
      city,
      date,
      q,
      category,
      theme,
      company: companyFilter,
      minPrice,
      maxPrice,
    };
    const merged = { ...current, ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v) p.set(k, v);
    }
    return `/browse?${p.toString()}`;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Location Context Banner — DoorDash-style gate */}
      {city && !noServiceArea && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-4 mb-6 flex flex-wrap items-center gap-3">
          <span className="text-indigo-600 text-lg">📍</span>
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-indigo-900">
              Showing rentals available in {city}
            </span>
            <span className="text-indigo-600 text-sm ml-2">
              — {servingCompanies.length} company
              {servingCompanies.length !== 1 ? "s" : ""} deliver here
            </span>
            {date && (
              <span className="text-indigo-500 text-sm ml-2">
                · Event date:{" "}
                {new Date(date + "T00:00:00").toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
          <Link
            href={buildUrl({ city: undefined, date: undefined })}
            className="text-xs text-indigo-500 hover:text-indigo-700 whitespace-nowrap"
          >
            Change location ×
          </Link>
        </div>
      )}

      {/* No coverage state */}
      {noServiceArea && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-8 mb-6 text-center">
          <div className="text-5xl mb-3">📍</div>
          <h2 className="text-xl font-bold text-amber-900 mb-2">
            No companies in &quot;{city}&quot; yet
          </h2>
          <p className="text-amber-700 mb-5 max-w-md mx-auto text-sm">
            We don&apos;t have any verified rental companies serving that area
            right now. Browse all available rentals, or check back soon as we
            add new companies every week.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/browse"
              className="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors text-sm"
            >
              Browse All Rentals
            </Link>
            <Link
              href="#"
              className="border border-amber-300 text-amber-800 font-semibold px-6 py-3 rounded-xl hover:bg-amber-100 transition-colors text-sm"
            >
              Notify Me When Available
            </Link>
          </div>
        </div>
      )}

      {/* Page Header */}
      {!noServiceArea && (
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            {q
              ? `Results for "${q}"`
              : category
              ? category
              : city
              ? `Party Rentals Near ${city}`
              : "All Party Rentals"}
          </h1>
          <p className="text-gray-500 text-sm">
            {filtered.length} item{filtered.length !== 1 ? "s" : ""} available
            {city ? ` · delivered to ${city}` : ""}
          </p>
        </div>
      )}

      {/* Keyword search bar — preserves city/date context */}
      {!noServiceArea && (
        <form method="GET" className="mb-8">
          <div className="flex gap-3">
            {city && <input type="hidden" name="city" value={city} />}
            {date && <input type="hidden" name="date" value={date} />}
            {category && <input type="hidden" name="category" value={category} />}
            <input
              name="q"
              type="text"
              defaultValue={q}
              placeholder="Search by theme, name, size, color, type..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
            >
              Search
            </button>
          </div>
        </form>
      )}

      {!noServiceArea && (
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-6 sticky top-24">
              {/* Category Filter */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Category</h3>
                <div className="space-y-1">
                  <Link
                    href={buildUrl({ category: undefined, theme: undefined })}
                    className={`block text-sm px-3 py-2 rounded-lg transition-colors ${
                      !category
                        ? "bg-indigo-50 text-indigo-700 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    All Categories
                  </Link>
                  {allCategories.map((cat) => {
                    const count = filtered.filter((i) => i.category === cat).length;
                    const totalCount = rentalItems
                      .filter((i) => servingCompanyIds.has(i.companyId))
                      .filter((i) => i.category === cat).length;
                    if (totalCount === 0) return null;
                    return (
                      <Link
                        key={cat}
                        href={buildUrl({ category: cat, theme: undefined })}
                        className={`flex justify-between items-center text-sm px-3 py-2 rounded-lg transition-colors ${
                          category === cat
                            ? "bg-indigo-50 text-indigo-700 font-medium"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <span>{cat}</span>
                        <span className="text-xs text-gray-400">{totalCount}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Company Filter — only shows companies that serve the city */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Company</h3>
                <div className="space-y-1">
                  {servingCompanies.map((co) => (
                    <Link
                      key={co.id}
                      href={buildUrl({ company: co.id })}
                      className={`block text-sm px-3 py-2 rounded-lg transition-colors ${
                        companyFilter === co.id
                          ? "bg-indigo-50 text-indigo-700 font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="truncate">{co.name}</span>
                        <span className="text-xs text-yellow-500 shrink-0">
                          ★{co.rating}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Price Range</h3>
                <div className="space-y-1">
                  {[
                    { label: "Under $150", min: undefined, max: "150" },
                    { label: "$150 – $250", min: "150", max: "250" },
                    { label: "$250 – $400", min: "250", max: "400" },
                    { label: "$400+", min: "400", max: undefined },
                  ].map((range) => {
                    const isActive =
                      minPrice === range.min && maxPrice === range.max;
                    return (
                      <Link
                        key={range.label}
                        href={buildUrl({ minPrice: range.min, maxPrice: range.max })}
                        className={`block text-sm px-3 py-2 rounded-lg transition-colors ${
                          isActive
                            ? "bg-indigo-50 text-indigo-700 font-medium"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {range.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Theme Filter */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Theme</h3>
                <div className="flex flex-wrap gap-1.5">
                  {allThemes.slice(0, 16).map((t) => (
                    <Link
                      key={t}
                      href={buildUrl({ theme: t })}
                      className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                        theme === t
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "border-gray-200 text-gray-600 hover:border-indigo-300"
                      }`}
                    >
                      {t}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Clear filters */}
              {(category || companyFilter || minPrice || maxPrice || theme || q) && (
                <Link
                  href={buildUrl({
                    category: undefined,
                    company: undefined,
                    minPrice: undefined,
                    maxPrice: undefined,
                    theme: undefined,
                    q: undefined,
                  })}
                  className="block text-center text-sm text-red-500 hover:text-red-700 font-medium"
                >
                  Clear all filters
                </Link>
              )}
            </div>
          </aside>

          {/* Results Grid */}
          <div className="flex-1 min-w-0">
            {/* Active filter chips */}
            {(category || theme || companyFilter || city) && (
              <div className="flex flex-wrap gap-2 mb-5">
                {city && (
                  <span className="flex items-center gap-1 bg-indigo-100 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full">
                    📍 {city}
                    <Link href={buildUrl({ city: undefined, date: undefined })} className="ml-1 hover:text-indigo-900">×</Link>
                  </span>
                )}
                {category && (
                  <span className="flex items-center gap-1 bg-indigo-100 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full">
                    {category}
                    <Link href={buildUrl({ category: undefined })} className="ml-1 hover:text-indigo-900">×</Link>
                  </span>
                )}
                {theme && (
                  <span className="flex items-center gap-1 bg-purple-100 text-purple-700 text-xs font-medium px-3 py-1.5 rounded-full">
                    Theme: {theme}
                    <Link href={buildUrl({ theme: undefined })} className="ml-1 hover:text-purple-900">×</Link>
                  </span>
                )}
                {companyFilter && (
                  <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full">
                    {companies.find((c) => c.id === companyFilter)?.name}
                    <Link href={buildUrl({ company: undefined })} className="ml-1 hover:text-green-900">×</Link>
                  </span>
                )}
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🎈</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No results found
                </h3>
                <p className="text-gray-500 mb-6">
                  Try a different search term, category, or clear your filters.
                </p>
                <Link
                  href={buildUrl({
                    category: undefined,
                    theme: undefined,
                    company: undefined,
                    minPrice: undefined,
                    maxPrice: undefined,
                    q: undefined,
                  })}
                  className="inline-block bg-indigo-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  Clear Filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((item) => {
                  const company = getCompanyById(item.companyId);
                  if (!company) return null;
                  return <ItemCard key={item.id} item={item} company={company} />;
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
