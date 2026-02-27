import Link from "next/link";
import { rentalItems, companies, getCompanyById } from "@/lib/data";
import ItemCard from "@/components/ItemCard";
import { Category } from "@/types";

interface SearchParams {
  category?: string;
  q?: string;
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
  const { category, q, minPrice, maxPrice, company: companyFilter, theme } = params;

  let filtered = rentalItems;

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {q
            ? `Results for "${q}"`
            : category
            ? `${category}`
            : "All Party Rentals"}
        </h1>
        <p className="text-gray-500">
          {filtered.length} item{filtered.length !== 1 ? "s" : ""} available
        </p>
      </div>

      {/* Search bar */}
      <form method="GET" className="mb-8">
        <div className="flex gap-3">
          <input
            name="q"
            type="text"
            defaultValue={q}
            placeholder="Search by theme, name, size, type..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"
          />
          {category && <input type="hidden" name="category" value={category} />}
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-6 sticky top-24">
            {/* Category Filter */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Category</h3>
              <div className="space-y-1">
                <Link
                  href={q ? `/browse?q=${q}` : "/browse"}
                  className={`block text-sm px-3 py-2 rounded-lg transition-colors ${
                    !category
                      ? "bg-indigo-50 text-indigo-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  All Categories
                </Link>
                {allCategories.map((cat) => {
                  const count = rentalItems.filter((i) => i.category === cat).length;
                  if (count === 0) return null;
                  const href = q
                    ? `/browse?q=${q}&category=${encodeURIComponent(cat)}`
                    : `/browse?category=${encodeURIComponent(cat)}`;
                  return (
                    <Link
                      key={cat}
                      href={href}
                      className={`flex justify-between items-center text-sm px-3 py-2 rounded-lg transition-colors ${
                        category === cat
                          ? "bg-indigo-50 text-indigo-700 font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span>{cat}</span>
                      <span className="text-xs text-gray-400">{count}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Company Filter */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Company</h3>
              <div className="space-y-1">
                {companies.map((co) => {
                  const params = new URLSearchParams();
                  if (q) params.set("q", q);
                  if (category) params.set("category", category);
                  params.set("company", co.id);
                  return (
                    <Link
                      key={co.id}
                      href={`/browse?${params.toString()}`}
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
                  );
                })}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Price Range</h3>
              <div className="space-y-1">
                {[
                  { label: "Under $150", max: "150" },
                  { label: "$150 – $250", min: "150", max: "250" },
                  { label: "$250 – $400", min: "250", max: "400" },
                  { label: "$400+", min: "400" },
                ].map((range) => {
                  const params = new URLSearchParams();
                  if (q) params.set("q", q);
                  if (category) params.set("category", category);
                  if (range.min) params.set("minPrice", range.min);
                  if (range.max) params.set("maxPrice", range.max);
                  const isActive =
                    minPrice === range.min && maxPrice === range.max;
                  return (
                    <Link
                      key={range.label}
                      href={`/browse?${params.toString()}`}
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
                {allThemes.slice(0, 16).map((t) => {
                  const params = new URLSearchParams();
                  if (q) params.set("q", q);
                  if (category) params.set("category", category);
                  params.set("theme", t);
                  return (
                    <Link
                      key={t}
                      href={`/browse?${params.toString()}`}
                      className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                        theme === t
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "border-gray-200 text-gray-600 hover:border-indigo-300"
                      }`}
                    >
                      {t}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Clear filters */}
            {(category || companyFilter || minPrice || maxPrice || theme) && (
              <Link
                href={q ? `/browse?q=${q}` : "/browse"}
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
          {(category || theme || companyFilter) && (
            <div className="flex flex-wrap gap-2 mb-5">
              {category && (
                <span className="flex items-center gap-1 bg-indigo-100 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full">
                  {category}
                  <Link href="/browse" className="ml-1 hover:text-indigo-900">×</Link>
                </span>
              )}
              {theme && (
                <span className="flex items-center gap-1 bg-purple-100 text-purple-700 text-xs font-medium px-3 py-1.5 rounded-full">
                  Theme: {theme}
                  <Link href={category ? `/browse?category=${category}` : "/browse"} className="ml-1 hover:text-purple-900">×</Link>
                </span>
              )}
              {companyFilter && (
                <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full">
                  {companies.find((c) => c.id === companyFilter)?.name}
                  <Link href={category ? `/browse?category=${category}` : "/browse"} className="ml-1 hover:text-green-900">×</Link>
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
                href="/browse"
                className="inline-block bg-indigo-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
              >
                View All Rentals
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
    </div>
  );
}
