import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getCompanyById, getItemsByCompany } from "@/lib/data";
import ItemCard from "@/components/ItemCard";

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = getCompanyById(id);
  if (!company) notFound();

  const items = getItemsByCompany(id);

  const categoryGroups = items.reduce<Record<string, typeof items>>(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {}
  );

  return (
    <div>
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <nav className="flex items-center gap-2 text-sm text-indigo-200 mb-6">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/browse" className="hover:text-white">Browse</Link>
            <span>/</span>
            <span className="text-white">{company.name}</span>
          </nav>

          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white/20 relative shrink-0">
              <Image
                src={company.logo}
                alt={company.name}
                fill
                className="object-cover"
                sizes="96px"
                priority
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold">{company.name}</h1>
                {company.verified && (
                  <span className="bg-white/20 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                    ✓ Verified
                  </span>
                )}
                {company.insuranceCertified && (
                  <span className="bg-white/20 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                    ✓ Insured
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mb-3 text-indigo-100 flex-wrap">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-300">★</span>
                  <span className="font-semibold text-white">{company.rating}</span>
                  <span>({company.reviewCount} reviews)</span>
                </div>
                <span>·</span>
                <span>📍 {company.location}</span>
                <span>·</span>
                <span>{company.yearsInBusiness} years in business</span>
                <span>·</span>
                <span>{items.length} items available</span>
              </div>
              <p className="text-indigo-100 max-w-2xl text-sm leading-relaxed">
                {company.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6 sticky top-24">
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Contact</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span>📞</span>
                    <a href={`tel:${company.phone}`} className="hover:text-gray-900">
                      {company.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>✉️</span>
                    <a href={`mailto:${company.email}`} className="hover:text-gray-900 truncate">
                      {company.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🌐</span>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-700 truncate"
                    >
                      Visit website
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-3">Service Area</h3>
                <div className="flex flex-wrap gap-1.5">
                  {company.serviceArea.map((city) => (
                    <span
                      key={city}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                    >
                      {city}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-3">Credentials</h3>
                <div className="space-y-2">
                  {company.verified && (
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <span>✓</span>
                      <span>Verified Company</span>
                    </div>
                  )}
                  {company.insuranceCertified && (
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <span>✓</span>
                      <span>Insurance Certified</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>✓</span>
                    <span>Safety Standards Compliant</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>✓</span>
                    <span>Equipment Sanitized</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">Rating</h3>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-3xl font-bold text-gray-900">
                    {company.rating}
                  </span>
                  <div>
                    <div className="text-yellow-400 text-lg">★★★★★</div>
                    <div className="text-xs text-gray-400">
                      {company.reviewCount} reviews
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  {[
                    { label: "Punctuality", val: 98 },
                    { label: "Cleanliness", val: 97 },
                    { label: "Value", val: 94 },
                    { label: "Communication", val: 96 },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-24 shrink-0">{r.label}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-indigo-500 h-1.5 rounded-full"
                          style={{ width: `${r.val}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-6 text-right">
                        {(r.val / 20).toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {Object.entries(categoryGroups).map(([cat, catItems]) => (
              <div key={cat} className="mb-12">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-xl font-bold text-gray-900">{cat}</h2>
                  <span className="text-sm text-gray-400">
                    {catItems.length} item{catItems.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {catItems.map((item) => (
                    <ItemCard key={item.id} item={item} company={company} />
                  ))}
                </div>
              </div>
            ))}

            {/* Reviews Section */}
            <div className="mt-10">
              <h2 className="text-xl font-bold text-gray-900 mb-5">
                Customer Reviews
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    name: "Sarah M.",
                    date: "January 2025",
                    rating: 5,
                    text: "Absolutely amazing! The bounce house was spotless, delivered right on time, and the kids had a blast. Will definitely book again!",
                  },
                  {
                    name: "David K.",
                    date: "December 2024",
                    rating: 5,
                    text: "Professional team, easy setup, and the equipment was in perfect condition. Best birthday party we've ever thrown!",
                  },
                  {
                    name: "Jennifer L.",
                    date: "November 2024",
                    rating: 5,
                    text: "Rented the 4-in-1 combo for my daughter's princess party. The kids literally did not want to leave. Highly recommend!",
                  },
                  {
                    name: "Mike R.",
                    date: "October 2024",
                    rating: 4,
                    text: "Great experience overall. Slight delay on pickup but they were very communicative. Product quality was excellent.",
                  },
                ].map((review) => (
                  <div
                    key={review.name}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                        {review.name[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-gray-900">
                          {review.name}
                        </div>
                        <div className="text-xs text-gray-400">{review.date}</div>
                      </div>
                      <div className="ml-auto text-yellow-400 text-sm">
                        {"★".repeat(review.rating)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {review.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
