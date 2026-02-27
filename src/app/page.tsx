import Link from "next/link";
import Image from "next/image";
import { rentalItems, companies, categories, getCompanyById } from "@/lib/data";
import ItemCard from "@/components/ItemCard";
import HeroSearch from "@/components/HeroSearch";

export default function HomePage() {
  const featuredItems = rentalItems.filter((i) => i.available).slice(0, 6);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
          <div className="absolute top-10 left-10 text-8xl">🏰</div>
          <div className="absolute top-20 right-20 text-6xl">💦</div>
          <div className="absolute bottom-10 left-1/4 text-7xl">🎪</div>
          <div className="absolute bottom-20 right-10 text-5xl">⭐</div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
            Book the Perfect
            <br />
            <span className="text-yellow-300">Bounce House</span> for Your Party
          </h1>
          <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
            Browse hundreds of bounce houses, water slides, and party rentals from
            top-rated local companies. Delivered and set up at your door.
          </p>

          {/* Search Bar */}
          <HeroSearch />

          {/* Thumbtack-style escape hatch */}
          <p className="mt-4 text-sm text-indigo-200">
            Not sure what you need?{" "}
            <Link
              href="/plan"
              className="text-white font-semibold underline underline-offset-2 hover:text-yellow-200 transition-colors"
            >
              Describe your event and get personalized picks →
            </Link>
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-sm text-indigo-200">
            <span>✓ Free delivery included</span>
            <span>✓ Professional setup</span>
            <span>✓ Insured companies</span>
            <span>✓ Instant confirmation</span>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/browse?category=${encodeURIComponent(cat.name)}`}
              className="flex flex-col items-center gap-2 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">
                {cat.icon}
              </span>
              <span className="text-xs font-medium text-gray-700 text-center leading-tight">
                {cat.name}
              </span>
              {cat.count > 0 && (
                <span className="text-xs text-gray-400">{cat.count}</span>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Get Matched Banner */}
      <section className="max-w-7xl mx-auto px-4 pb-4">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-white">
          <div>
            <div className="text-3xl mb-2">🎯</div>
            <h2 className="text-2xl font-bold mb-1">Not sure what to book?</h2>
            <p className="text-indigo-200 max-w-md">
              Answer 4 quick questions about your event — kids, age, budget, theme — and we&apos;ll recommend exactly the right rentals for you.
            </p>
          </div>
          <div className="shrink-0">
            <Link
              href="/plan"
              className="inline-block bg-white text-indigo-700 font-bold px-8 py-4 rounded-2xl hover:bg-indigo-50 transition-colors text-base whitespace-nowrap"
            >
              Get Personalized Picks →
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Popular Rentals</h2>
          <Link
            href="/browse"
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredItems.map((item) => {
            const company = getCompanyById(item.companyId);
            if (!company) return null;
            return <ItemCard key={item.id} item={item} company={company} />;
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white border-t border-gray-100 mt-16 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            How PlayBase Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                step: "1",
                icon: "🔍",
                title: "Search & Browse",
                desc: "Enter your zip code and event date. Browse bounce houses, water slides, and party rentals from local companies near you.",
              },
              {
                step: "2",
                icon: "📅",
                title: "Book & Confirm",
                desc: "Choose your item, select your rental duration, and complete booking in minutes. Get instant confirmation and event details.",
              },
              {
                step: "3",
                icon: "🎉",
                title: "Enjoy Your Party",
                desc: "The company delivers, sets up, and takes everything down when you're done. All you have to do is have fun!",
              },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">{s.icon}</span>
                </div>
                <div className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-1">
                  Step {s.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Companies */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Top-Rated Companies</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Link
              key={company.id}
              href={`/companies/${company.id}`}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md p-6 transition-all group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 relative shrink-0">
                  <Image
                    src={company.logo}
                    alt={company.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {company.name}
                  </h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-yellow-400 text-sm">★</span>
                    <span className="text-sm font-semibold">{company.rating}</span>
                    <span className="text-gray-400 text-sm">
                      ({company.reviewCount} reviews)
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">📍 {company.location}</p>
                </div>
              </div>

              <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                {company.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {company.verified && (
                  <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                    ✓ Verified
                  </span>
                )}
                {company.insuranceCertified && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                    ✓ Insured
                  </span>
                )}
                <span className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full">
                  {company.yearsInBusiness} yrs experience
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-indigo-600 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-3">
            Ready to throw the perfect party?
          </h2>
          <p className="text-indigo-200 mb-8 text-lg">
            Join thousands of families who&apos;ve booked through PlayBase.
          </p>
          <Link
            href="/browse"
            className="inline-block bg-white text-indigo-600 font-bold px-8 py-4 rounded-xl hover:bg-indigo-50 transition-colors text-lg"
          >
            Browse All Rentals
          </Link>
        </div>
      </section>
    </div>
  );
}
