import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getItemById, getCompanyById, getItemsByCompany } from "@/lib/data";
import ItemCard from "@/components/ItemCard";

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = getItemById(id);
  if (!item) notFound();

  const company = getCompanyById(item.companyId);
  if (!company) notFound();

  const moreItems = getItemsByCompany(item.companyId)
    .filter((i) => i.id !== item.id)
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        <span>/</span>
        <Link href="/browse" className="hover:text-gray-700">Browse</Link>
        <span>/</span>
        <Link
          href={`/browse?category=${encodeURIComponent(item.category)}`}
          className="hover:text-gray-700"
        >
          {item.category}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate">{item.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="col-span-2 relative h-80 rounded-2xl overflow-hidden bg-gray-100">
              <Image
                src={item.images[0]}
                alt={item.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
                priority
              />
            </div>
            {item.images.slice(1).map((img, i) => (
              <div
                key={i}
                className="relative h-48 rounded-2xl overflow-hidden bg-gray-100"
              >
                <Image
                  src={img}
                  alt={`${item.name} ${i + 2}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>

          {/* Title & Rating */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full mb-2 inline-block">
                {item.category}
              </span>
              <h1 className="text-3xl font-bold text-gray-900">{item.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-yellow-400">★★★★★</span>
                <span className="text-sm font-medium text-gray-700">
                  {company.rating}
                </span>
                <span className="text-sm text-gray-400">
                  ({company.reviewCount} reviews)
                </span>
                <span className="text-gray-300">·</span>
                <Link
                  href={`/companies/${company.id}`}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  {company.name}
                </Link>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-600 leading-relaxed">{item.description}</p>
          </div>

          {/* Specs Grid */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Dimensions", value: item.dimensions },
                { label: "Capacity", value: item.capacity > 0 ? `${item.capacity} kids` : "N/A" },
                { label: "Age Range", value: item.ageRange },
                { label: "Setup Time", value: `~${item.setupTime} min` },
                { label: "Colors", value: item.colors.join(", ") },
                { label: "Category", value: item.category },
              ].map((spec) => (
                <div key={spec.label}>
                  <div className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">
                    {spec.label}
                  </div>
                  <div className="text-sm font-semibold text-gray-800">
                    {spec.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Features</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {item.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-green-500 font-bold">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Themes */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Themes</h2>
            <div className="flex flex-wrap gap-2">
              {item.themes.map((theme) => (
                <Link
                  key={theme}
                  href={`/browse?theme=${encodeURIComponent(theme)}`}
                  className="text-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors"
                >
                  {theme}
                </Link>
              ))}
            </div>
          </div>

          {/* Safety Notes */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8">
            <h2 className="text-sm font-bold text-amber-800 mb-1.5 flex items-center gap-2">
              <span>⚠️</span> Safety Guidelines
            </h2>
            <p className="text-sm text-amber-700">{item.safetyNotes}</p>
          </div>

          {/* Company Card */}
          <div className="border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Provided by
            </h2>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 relative shrink-0">
                <Image
                  src={company.logo}
                  alt={company.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h3 className="font-bold text-gray-900 text-lg">{company.name}</h3>
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
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-yellow-400">★</span>
                  <span className="text-sm font-semibold">{company.rating}</span>
                  <span className="text-gray-400 text-sm">
                    ({company.reviewCount} reviews)
                  </span>
                  <span className="text-gray-300">·</span>
                  <span className="text-sm text-gray-500">
                    {company.yearsInBusiness} years in business
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                  {company.description}
                </p>
                <div className="mb-3">
                  <div className="text-xs text-gray-400 font-medium mb-1">Service Area</div>
                  <p className="text-xs text-gray-600">
                    {company.serviceArea.slice(0, 6).join(", ")}
                    {company.serviceArea.length > 6
                      ? ` + ${company.serviceArea.length - 6} more cities`
                      : ""}
                  </p>
                </div>
                <Link
                  href={`/companies/${company.id}`}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  View all {company.name} rentals →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 sticky top-24">
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-3xl font-bold text-gray-900">${item.price}</span>
              <span className="text-gray-500">/ day</span>
            </div>
            <div className="flex items-center gap-1 mb-6">
              <span className="text-yellow-400 text-sm">★</span>
              <span className="text-sm font-medium">{company.rating}</span>
              <span className="text-sm text-gray-400">
                · {company.reviewCount} reviews
              </span>
            </div>

            <div className="space-y-3 mb-6">
              <div>
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5 block">
                  Delivery ZIP Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. 94025"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5 block">
                  Event Date
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5 block">
                    Start Time
                  </label>
                  <input
                    type="time"
                    defaultValue="10:00"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5 block">
                    End Time
                  </label>
                  <input
                    type="time"
                    defaultValue="18:00"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>
            </div>

            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-colors text-base mb-4">
              Reserve Now
            </button>

            <p className="text-xs text-center text-gray-400 mb-4">
              You won&apos;t be charged yet
            </p>

            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">${item.price} × 1 day</span>
                <span className="font-medium">${item.price}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery & setup</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Service fee</span>
                <span className="font-medium">${Math.round(item.price * 0.1)}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>${item.price + Math.round(item.price * 0.1)}</span>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>🛡️</span>
                <span>All companies are verified & insured</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>✓</span>
                <span>Equipment cleaned & sanitized</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>📞</span>
                <span>24/7 customer support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* More from this company */}
      {moreItems.length > 0 && (
        <div className="mt-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              More from {company.name}
            </h2>
            <Link
              href={`/companies/${company.id}`}
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {moreItems.map((i) => (
              <ItemCard key={i.id} item={i} company={company} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
