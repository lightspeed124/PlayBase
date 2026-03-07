import Image from "next/image";
import Link from "next/link";

const CATEGORIES = [
  { name: "Bounce Houses", slug: "Bounce+Houses" },
  { name: "Bounce & Slide Combo", slug: "Bounce+%26+Slide+Combo" },
  { name: "Water Slides", slug: "Water+Slides" },
  { name: "Obstacle Courses", slug: "Obstacle+Courses" },
  { name: "Interactive Games", slug: "Interactive+Games" },
  { name: "Sports Games", slug: "Sports+Games" },
  { name: "Toddler Units", slug: "Toddler+Units" },
  { name: "Water Games", slug: "Water+Games" },
  { name: "Concessions", slug: "Concessions" },
  { name: "Tables & Chairs", slug: "Tables+%26+Chairs" },
  { name: "Tents", slug: "Tents" },
];

const FOOTER_CATEGORIES_LIMIT = 6;
const FOOTER_LOCATIONS_LIMIT = 12;

const BAY_AREA_CITIES = [
  // Major cities by population/importance
  { name: "San Francisco", slug: "san-francisco" },
  { name: "San Jose", slug: "san-jose" },
  { name: "Oakland", slug: "oakland" },
  { name: "Fremont", slug: "fremont" },
  { name: "Santa Clara", slug: "santa-clara" },
  { name: "Sunnyvale", slug: "sunnyvale" },
  { name: "Hayward", slug: "hayward" },
  { name: "Concord", slug: "concord" },
  { name: "Berkeley", slug: "berkeley" },
  { name: "Richmond", slug: "richmond" },
  { name: "Daly City", slug: "daly-city" },
  { name: "San Mateo", slug: "san-mateo" },
  // Below the fold — accessible via "View all"
  { name: "Palo Alto", slug: "palo-alto" },
  { name: "Mountain View", slug: "mountain-view" },
  { name: "Cupertino", slug: "cupertino" },
  { name: "Milpitas", slug: "milpitas" },
  { name: "Redwood City", slug: "redwood-city" },
  { name: "Walnut Creek", slug: "walnut-creek" },
  { name: "Pleasanton", slug: "pleasanton" },
  { name: "Dublin", slug: "dublin" },
  { name: "Livermore", slug: "livermore" },
  { name: "San Ramon", slug: "san-ramon" },
  { name: "Union City", slug: "union-city" },
  { name: "San Leandro", slug: "san-leandro" },
  { name: "Antioch", slug: "antioch" },
  { name: "Pittsburg", slug: "pittsburg" },
  { name: "Vallejo", slug: "vallejo" },
  { name: "Fairfield", slug: "fairfield" },
  { name: "San Rafael", slug: "san-rafael" },
  { name: "Novato", slug: "novato" },
  { name: "Santa Rosa", slug: "santa-rosa" },
  { name: "Napa", slug: "napa" },
  { name: "Petaluma", slug: "petaluma" },
  { name: "Campbell", slug: "campbell" },
  { name: "Los Gatos", slug: "los-gatos" },
  { name: "Saratoga", slug: "saratoga" },
  { name: "Morgan Hill", slug: "morgan-hill" },
  { name: "Gilroy", slug: "gilroy" },
  { name: "Newark", slug: "newark" },
  { name: "Alameda", slug: "alameda" },
  { name: "South San Francisco", slug: "south-san-francisco" },
  { name: "San Bruno", slug: "san-bruno" },
  { name: "Burlingame", slug: "burlingame" },
  { name: "Foster City", slug: "foster-city" },
  { name: "Menlo Park", slug: "menlo-park" },
  { name: "Half Moon Bay", slug: "half-moon-bay" },
  { name: "Danville", slug: "danville" },
  { name: "Lafayette", slug: "lafayette" },
  { name: "Martinez", slug: "martinez" },
  { name: "Pleasant Hill", slug: "pleasant-hill" },
  { name: "Mill Valley", slug: "mill-valley" },
  { name: "Pacifica", slug: "pacifica" },
  { name: "Benicia", slug: "benicia" },
  { name: "Vacaville", slug: "vacaville" },
  { name: "Rohnert Park", slug: "rohnert-park" },
];

const OCCASIONS = [
  { name: "Birthday Parties", slug: "birthday-parties" },
  { name: "School & Church Events", slug: "school-church-events" },
  { name: "Corporate Outings", slug: "corporate-outings" },
  { name: "Festivals & Carnivals", slug: "festivals-carnivals" },
];

const SOCIALS = [
  {
    name: "Facebook",
    href: "#",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "#",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    href: "#",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "#",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: "Pinterest",
    href: "#",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              <Image src="/logo.svg" alt="JumpFun" width={140} height={40} className="brightness-0 invert" />
            </div>
            <p className="text-sm text-gray-400 mb-5">
              Your marketplace for bounce houses and party rentals from top-rated local companies.
            </p>
            <div className="flex gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  aria-label={s.name}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Browse Rentals — top categories + "View all" */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Browse Rentals</h4>
            <ul className="space-y-1.5 text-sm">
              {CATEGORIES.slice(0, FOOTER_CATEGORIES_LIMIT).map((c) => (
                <li key={c.name}>
                  <Link href={`/browse?category=${c.slug}`} className="hover:text-white transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/browse" className="text-gray-500 hover:text-white transition-colors">
                  View all &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Occasions */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Popular Occasions</h4>
            <ul className="space-y-1.5 text-sm">
              {OCCASIONS.map((o) => (
                <li key={o.slug}>
                  <Link href={`/occasions/${o.slug}`} className="hover:text-white transition-colors">
                    {o.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Locations */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-white font-semibold mb-3 text-sm">Service Locations</h4>
            <p className="text-sm mb-2">
              <Link href="/locations/sf-bay-area" className="text-gray-200 font-medium hover:text-white transition-colors">
                All SF Bay Area
              </Link>
            </p>
            <ul className="grid grid-cols-2 md:grid-cols-1 gap-x-6 gap-y-1 text-sm">
              {BAY_AREA_CITIES.slice(0, FOOTER_LOCATIONS_LIMIT).map((c) => (
                <li key={c.slug}>
                  <Link href={`/locations/${c.slug}`} className="hover:text-white transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/locations/sf-bay-area" className="text-gray-500 hover:text-white transition-colors">
                  View all &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Company</h4>
            <ul className="space-y-1.5 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">About JumpFun</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">List Your Company</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Safety Standards</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
            <h4 className="text-white font-semibold mb-3 mt-5 text-sm">Legal</h4>
            <ul className="space-y-1.5 text-sm">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Notice</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} JumpFun. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
