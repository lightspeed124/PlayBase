import Link from "next/link";

const OCCASIONS = [
  {
    name: "Birthday Parties",
    slug: "birthday-parties",
    emoji: "🎂",
    description: "Bounce houses, combos, and party extras kids love",
    color: "from-pink-50 to-rose-50",
    border: "border-pink-100",
  },
  {
    name: "School & Church Events",
    slug: "school-church-events",
    emoji: "🏫",
    description: "Large inflatables and games for big groups",
    color: "from-blue-50 to-sky-50",
    border: "border-blue-100",
  },
  {
    name: "Corporate Outings",
    slug: "corporate-outings",
    emoji: "🏢",
    description: "Team-building fun with obstacle courses and sports",
    color: "from-emerald-50 to-teal-50",
    border: "border-emerald-100",
  },
  {
    name: "Festivals & Carnivals",
    slug: "festivals-carnivals",
    emoji: "🎪",
    description: "Full carnival setups with concessions and games",
    color: "from-amber-50 to-orange-50",
    border: "border-amber-100",
  },
];

export default function PlanByOccasion() {
  return (
    <section>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Plan by Occasion</h2>
        <p className="text-gray-500 text-sm mt-2">Find the right rentals for your event type</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {OCCASIONS.map((o) => (
          <Link
            key={o.slug}
            href={`/occasions/${o.slug}`}
            className="group block"
          >
            <div
              className={`relative rounded-2xl bg-gradient-to-br ${o.color} border ${o.border} p-5 sm:p-6 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
            >
              <div className="text-4xl sm:text-5xl mb-3">{o.emoji}</div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight group-hover:text-brand-blue transition-colors">
                {o.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1.5 leading-snug line-clamp-2">
                {o.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
