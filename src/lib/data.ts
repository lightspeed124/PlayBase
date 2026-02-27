import { Company, RentalItem } from "@/types";

export const companies: Company[] = [
  {
    id: "kidzz-star-jumpers",
    name: "Kidzz Star Jumpers",
    slug: "kidzz-star-jumpers",
    logo: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=200&h=200&fit=crop",
    description:
      "Family-owned and operated for 27 years, Kidzz Star Jumpers provides high-quality, clean, and sanitized inflatables and party equipment across the Bay Area. From small backyard birthday parties to large corporate events, we handle every event with the utmost care.",
    yearsInBusiness: 27,
    rating: 4.9,
    reviewCount: 342,
    location: "East Palo Alto, CA",
    serviceArea: [
      "East Palo Alto",
      "Palo Alto",
      "Menlo Park",
      "Redwood City",
      "Mountain View",
      "Sunnyvale",
      "San Jose",
      "Fremont",
      "Cupertino",
      "Los Altos Hills",
      "Los Gatos",
      "San Mateo",
      "Union City",
      "Daly City",
      "San Francisco",
    ],
    phone: "(650) 555-0100",
    email: "info@kidzzstarjumpers.com",
    website: "https://kidzzstarjumpers.com",
    verified: true,
    insuranceCertified: true,
  },
  {
    id: "bay-area-bounce",
    name: "Bay Area Bounce",
    slug: "bay-area-bounce",
    logo: "https://images.unsplash.com/photo-1472289065668-ce650ac443d2?w=200&h=200&fit=crop",
    description:
      "Premium bounce house and party rental company serving the greater San Francisco Bay Area. We pride ourselves on fast delivery, professional setup, and spotless equipment.",
    yearsInBusiness: 12,
    rating: 4.7,
    reviewCount: 189,
    location: "San Jose, CA",
    serviceArea: [
      "San Jose",
      "Santa Clara",
      "Milpitas",
      "Campbell",
      "Los Gatos",
      "Saratoga",
      "Los Altos",
      "Mountain View",
      "Sunnyvale",
    ],
    phone: "(408) 555-0200",
    email: "info@bayareabounce.com",
    website: "https://bayareabounce.com",
    verified: true,
    insuranceCertified: true,
  },
  {
    id: "astro-jump-north-bay",
    name: "Astro Jump North Bay",
    slug: "astro-jump-north-bay",
    logo: "https://images.unsplash.com/photo-1566041510394-cf7c1b1eae6c?w=200&h=200&fit=crop",
    description:
      "Serving Marin, Sonoma, and Napa counties with top-of-the-line inflatable rentals, water slides, and party equipment. Over 15 years of making events unforgettable.",
    yearsInBusiness: 15,
    rating: 4.8,
    reviewCount: 214,
    location: "Santa Rosa, CA",
    serviceArea: [
      "Santa Rosa",
      "Petaluma",
      "Novato",
      "San Rafael",
      "Mill Valley",
      "Napa",
      "Sonoma",
      "Fairfax",
      "Corte Madera",
    ],
    phone: "(707) 555-0300",
    email: "info@astrojumpnorthbay.com",
    website: "https://astrojump.com/northbay",
    verified: true,
    insuranceCertified: true,
  },
];

export const rentalItems: RentalItem[] = [
  // --- KIDZZ STAR JUMPERS ---
  {
    id: "razzle-dazzle-castle",
    companyId: "kidzz-star-jumpers",
    name: "Razzle Dazzle Castle Jumper",
    slug: "razzle-dazzle-castle-jumper",
    category: "Bounce Houses",
    themes: ["Princess", "Castle", "Fantasy"],
    description:
      "A stunning castle-themed bounce house decorated with colorful towers and fun graphics. Perfect for birthday parties and backyard events. Features a large bouncing area, safety netting on all sides, and easy-access entry ramp. Our most popular rental for princess-themed parties!",
    dimensions: "15ft x 15ft x 12ft",
    capacity: 6,
    ageRange: "2–12 years",
    setupTime: 30,
    price: 169,
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?w=800&h=600&fit=crop",
    ],
    available: true,
    features: [
      "Safety netting on all sides",
      "Easy-access entry ramp",
      "Anchor stakes included",
      "Cleaned & sanitized before every rental",
    ],
    safetyNotes:
      "Maximum 5–6 kids of equal size. Adult supervision required at all times. Not suitable for adults.",
    colors: ["Pink", "Purple", "Yellow"],
  },
  {
    id: "razzle-dazzle-4in1",
    companyId: "kidzz-star-jumpers",
    name: "Razzle Dazzle 4-in-1 Combo",
    slug: "razzle-dazzle-4in1-combo",
    category: "Combos",
    themes: [
      "Princess",
      "Barbie",
      "Frozen",
      "Unicorn",
      "Hello Kitty",
      "Moana",
      "Disney",
      "My Little Pony",
    ],
    description:
      "The ultimate party combo! This 4-in-1 inflatable features a bounce area, climbing wall, slide, and obstacle section. Includes interchangeable themed banners — choose from Barbie, Hello Kitty, Tinkerbell, Moana, Dora, Sofia the First, Frozen, Little Mermaid, My Little Pony, Unicorn, and many more. One unit, endless themes!",
    dimensions: "20ft x 15ft x 14ft",
    capacity: 8,
    ageRange: "3–14 years",
    setupTime: 45,
    price: 249,
    images: [
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1519455953755-af066f52f1a6?w=800&h=600&fit=crop",
    ],
    available: true,
    features: [
      "4-in-1: bounce, climb, slide, obstacle",
      "Interchangeable themed banners",
      "Commercial-grade vinyl",
      "Blower motor included",
      "Cleaned & sanitized before every rental",
    ],
    safetyNotes:
      "One person on the slide at a time. Maximum weight per climber 150 lbs.",
    colors: ["Multi-color", "Pink", "Purple"],
  },
  {
    id: "disney-princess-large",
    companyId: "kidzz-star-jumpers",
    name: "Disney Princess 2-Jump (Large)",
    slug: "disney-princess-2-jump-large",
    category: "Bounce Houses",
    themes: ["Disney", "Princess", "Cinderella", "Ariel", "Belle"],
    description:
      "An extra-large officially licensed Disney Princess bounce house with two separate bouncing chambers. Features full-color artwork of Cinderella, Ariel, Belle, Rapunzel, and more. A dream come true for any little princess. The dual chambers allow kids of different ages to bounce safely.",
    dimensions: "22ft x 15ft x 14ft",
    capacity: 12,
    ageRange: "2–12 years",
    setupTime: 45,
    price: 299,
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
    ],
    available: true,
    features: [
      "Officially licensed Disney artwork",
      "Dual bouncing chambers",
      "Large interior headroom (14ft)",
      "Integrated safety features",
    ],
    safetyNotes:
      "Separate chambers for younger (2–5) and older (6–12) children recommended.",
    colors: ["Pink", "Blue", "Gold"],
  },
  {
    id: "castle-toddler",
    companyId: "kidzz-star-jumpers",
    name: "Castle Toddler Bounce House",
    slug: "castle-toddler-bounce-house",
    category: "Bounce Houses",
    themes: ["Castle", "Toddler", "Fun"],
    description:
      "Specially designed for the littlest bouncers! This compact toddler-safe bounce house has lower walls, soft interior padding, and gentle bounce surface — ideal for ages 1–5. Perfect for toddler birthday parties or playgroups. Features include a safety ball pit area inside.",
    dimensions: "12ft x 12ft x 8ft",
    capacity: 6,
    ageRange: "1–5 years",
    setupTime: 20,
    price: 139,
    images: [
      "https://images.unsplash.com/photo-1566041510394-cf7c1b1eae6c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
    ],
    available: true,
    features: [
      "Toddler-safe low walls",
      "Soft interior padding",
      "Built-in ball pit area",
      "Easy adult supervision design",
    ],
    safetyNotes:
      "For ages 1–5 only. No children over 5. Always have an adult within arm's reach.",
    colors: ["Yellow", "Red", "Blue"],
  },
  {
    id: "module-5in1-combo",
    companyId: "kidzz-star-jumpers",
    name: "Module 5-in-1 Combo",
    slug: "module-5in1-combo",
    category: "Combos",
    themes: ["Adventure", "Sports", "Jungle", "Multi"],
    description:
      "The all-in-one party solution! This massive 5-in-1 combo unit includes a bounce house, two slides, climbing wall, obstacle section, and basketball hoop inside. Available in multiple themes. Great for larger events where you want maximum entertainment value from a single unit.",
    dimensions: "25ft x 18ft x 16ft",
    capacity: 10,
    ageRange: "3–14 years",
    setupTime: 60,
    price: 349,
    images: [
      "https://images.unsplash.com/photo-1519455953755-af066f52f1a6?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?w=800&h=600&fit=crop",
    ],
    available: true,
    features: [
      "5-in-1 entertainment",
      "Dual slides",
      "Interior basketball hoop",
      "Climbing wall",
      "Obstacle section",
    ],
    safetyNotes:
      "One child at a time on slides. No flipping or rough play. Adult supervision required.",
    colors: ["Blue", "Red", "Yellow", "Green"],
  },
  {
    id: "tropical-water-slide",
    companyId: "kidzz-star-jumpers",
    name: "Tropical Water Slide",
    slug: "tropical-water-slide",
    category: "Water Slides",
    themes: ["Tropical", "Beach", "Summer", "Luau"],
    description:
      "Beat the heat with this towering 18-foot tropical water slide! Features a massive splash pool at the base, climbing ladder with safety handles, and a fast, thrilling slide. Decorated with palm trees and tropical colors. Requires a water hose connection. Perfect for summer parties.",
    dimensions: "18ft tall x 10ft wide x 20ft long",
    capacity: 1,
    ageRange: "5–17 years",
    setupTime: 45,
    price: 329,
    images: [
      "https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
    ],
    available: true,
    features: [
      "18ft tall slide",
      "Built-in splash pool",
      "Safety climbing handles",
      "Connects to standard garden hose",
    ],
    safetyNotes:
      "One rider at a time. Children under 5 not recommended. Must know how to swim or wear flotation device.",
    colors: ["Green", "Blue", "Yellow"],
  },
  {
    id: "obstacle-course-50ft",
    companyId: "kidzz-star-jumpers",
    name: "50ft Obstacle Course",
    slug: "50ft-obstacle-course",
    category: "Obstacle Courses",
    themes: ["Sports", "Adventure", "Challenge", "Competition"],
    description:
      "Get the competitive energy going with this 50-foot inflatable obstacle course! Features pop-ups, crawl tunnels, climbing walls, and a slide finish. Perfect for group events, school carnivals, or corporate team-building. Two lanes allow head-to-head racing. A crowd favorite at every event!",
    dimensions: "50ft x 12ft x 12ft",
    capacity: 4,
    ageRange: "5–17 years",
    setupTime: 60,
    price: 449,
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
    ],
    available: true,
    features: [
      "50ft dual-lane racing",
      "Pop-up obstacles",
      "Crawl tunnels",
      "Climbing walls",
      "Slide finish",
    ],
    safetyNotes:
      "No pushing or shoving. Remove shoes before entering. Ages 5+ only.",
    colors: ["Blue", "Red", "Yellow"],
  },
  {
    id: "popcorn-machine",
    companyId: "kidzz-star-jumpers",
    name: "Popcorn Machine",
    slug: "popcorn-machine",
    category: "Concessions",
    themes: ["Concessions", "Food", "Snacks"],
    description:
      "Classic commercial-grade popcorn machine rental. Makes fresh, delicious popcorn in minutes. Comes with 50 servings of popcorn supplies (kernels, oil, salt, and bags). Easy to operate — plug in and go! Great add-on for any party or event.",
    dimensions: "24in x 18in x 48in",
    capacity: 0,
    ageRange: "All ages",
    setupTime: 10,
    price: 79,
    images: [
      "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=800&h=600&fit=crop",
    ],
    available: true,
    features: [
      "Commercial-grade",
      "50 servings included",
      "Easy operation",
      "Cleaned before rental",
    ],
    safetyNotes: "Keep away from flammable materials. Adult operation recommended.",
    colors: ["Red", "Chrome"],
  },
  {
    id: "cotton-candy-machine",
    companyId: "kidzz-star-jumpers",
    name: "Cotton Candy Machine",
    slug: "cotton-candy-machine",
    category: "Concessions",
    themes: ["Concessions", "Food", "Carnival", "Snacks"],
    description:
      "Spin up some sweet fun with a cotton candy machine rental! Includes 50 servings of cotton candy floss sugar in assorted flavors (pink vanilla, blue raspberry, and grape). The machine is easy to use and adds a carnival atmosphere to any party.",
    dimensions: "24in x 24in x 18in",
    capacity: 0,
    ageRange: "All ages",
    setupTime: 10,
    price: 79,
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=600&fit=crop",
    ],
    available: true,
    features: [
      "50 servings included",
      "Assorted flavors",
      "Easy operation",
      "Carnival atmosphere",
    ],
    safetyNotes:
      "Keep away from children under 3. Hot spinning element — adult operation only.",
    colors: ["Pink", "White"],
  },
  {
    id: "tent-20x20",
    companyId: "kidzz-star-jumpers",
    name: "20x20 Canopy Tent",
    slug: "20x20-canopy-tent",
    category: "Tents",
    themes: ["Shade", "Outdoor", "Events"],
    description:
      "Provide shade and shelter for your guests with this large 20x20 canopy tent. Commercial-grade frame with white top. Can accommodate up to 40 people. Great for backyard parties, school events, and corporate gatherings. Sides available upon request.",
    dimensions: "20ft x 20ft",
    capacity: 40,
    ageRange: "All ages",
    setupTime: 45,
    price: 199,
    images: [
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop",
    ],
    available: true,
    features: [
      "Commercial-grade frame",
      "White canopy top",
      "Fits up to 40 people",
      "Sidewalls available",
    ],
    safetyNotes:
      "Do not use in high winds over 25mph. Must be staked or weighted on all corners.",
    colors: ["White"],
  },
  {
    id: "tables-chairs-package",
    companyId: "kidzz-star-jumpers",
    name: "Tables & Chairs Package (10 Tables / 80 Chairs)",
    slug: "tables-chairs-package",
    category: "Tables & Chairs",
    themes: ["Events", "Party", "Seating"],
    description:
      "Our most popular seating package — 10 rectangular 6-foot folding tables and 80 matching folding chairs. Perfect for parties, school events, or corporate gatherings. Tables seat 8 comfortably. Chairs are durable plastic folding chairs in white or black.",
    dimensions: "6ft tables, standard chairs",
    capacity: 80,
    ageRange: "All ages",
    setupTime: 30,
    price: 149,
    images: [
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=600&fit=crop",
    ],
    available: true,
    features: [
      "10 folding tables (6ft)",
      "80 folding chairs",
      "White or black chairs",
      "Clean and inspected",
    ],
    safetyNotes: "Max weight per chair 250 lbs. Do not stand on tables or chairs.",
    colors: ["White", "Black"],
  },

  // --- BAY AREA BOUNCE ---
  {
    id: "superhero-combo",
    companyId: "bay-area-bounce",
    name: "Superhero 4-in-1 Combo",
    slug: "superhero-4in1-combo",
    category: "Combos",
    themes: ["Superhero", "Marvel", "DC", "Spider-Man", "Batman"],
    description:
      "Every kid wants to be a superhero! This action-packed 4-in-1 combo features Spider-Man, Batman, and Avengers artwork throughout. Includes bounce area, climbing wall, two slides, and obstacle section. The ultimate combo for superhero fans of all ages.",
    dimensions: "22ft x 16ft x 15ft",
    capacity: 8,
    ageRange: "3–14 years",
    setupTime: 50,
    price: 279,
    images: [
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1566041510394-cf7c1b1eae6c?w=800&h=600&fit=crop",
    ],
    available: true,
    features: [
      "Marvel & DC themed",
      "4-in-1 entertainment",
      "Dual slides",
      "Interior obstacles",
    ],
    safetyNotes: "Maximum 8 children at one time. No rough play.",
    colors: ["Red", "Blue", "Black"],
  },
  {
    id: "jungle-safari-bounce",
    companyId: "bay-area-bounce",
    name: "Jungle Safari Bounce House",
    slug: "jungle-safari-bounce-house",
    category: "Bounce Houses",
    themes: ["Jungle", "Safari", "Animals", "Adventure"],
    description:
      "Go wild at your party with this Jungle Safari themed bounce house! Full of lions, giraffes, elephants, and zebras throughout. Features an extra-large bounce area, safety netting on all four sides, and a fun entry slide. Perfect for animal lovers and adventurous kids!",
    dimensions: "15ft x 15ft x 13ft",
    capacity: 6,
    ageRange: "2–12 years",
    setupTime: 30,
    price: 179,
    images: [
      "https://images.unsplash.com/photo-1566041510394-cf7c1b1eae6c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=600&fit=crop",
    ],
    available: true,
    features: [
      "Jungle/animal themed artwork",
      "Extra-large bounce area",
      "Safety netting on all sides",
      "Built-in entry slide",
    ],
    safetyNotes: "Max 6 children. Remove shoes before entering.",
    colors: ["Green", "Brown", "Yellow"],
  },
  {
    id: "dual-water-slide-combo",
    companyId: "bay-area-bounce",
    name: "Dual Lane Water Slide Combo",
    slug: "dual-lane-water-slide-combo",
    category: "Water Slides",
    themes: ["Summer", "Beach", "Tropical", "Water Park"],
    description:
      "Double the fun with this dual-lane water slide! Two riders can race side-by-side down this 20-foot giant. Features a large splash pool at the bottom, safety handles all the way up, and a wide launching platform at the top. The most exciting water slide rental we offer!",
    dimensions: "20ft tall x 18ft wide x 22ft long",
    capacity: 2,
    ageRange: "5–17 years",
    setupTime: 60,
    price: 399,
    images: [
      "https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
    ],
    available: true,
    features: [
      "Dual racing lanes",
      "20ft height",
      "Large splash pool",
      "Safety handles throughout",
    ],
    safetyNotes:
      "One rider per lane. Ages 5+ only. Children under 48\" height should be accompanied by adult.",
    colors: ["Blue", "Green"],
  },

  // --- ASTRO JUMP NORTH BAY ---
  {
    id: "space-adventure-combo",
    companyId: "astro-jump-north-bay",
    name: "Space Adventure 5-in-1 Combo",
    slug: "space-adventure-5in1-combo",
    category: "Combos",
    themes: ["Space", "Astronaut", "Galaxy", "Science"],
    description:
      "Blast off to fun with this out-of-this-world space-themed combo! Featuring planets, rockets, and astronaut graphics throughout. Includes a bounce house, two slides, climbing wall, and obstacle zone. Perfect for STEM-themed parties or any kid who dreams of space!",
    dimensions: "24ft x 16ft x 15ft",
    capacity: 10,
    ageRange: "3–15 years",
    setupTime: 60,
    price: 379,
    images: [
      "https://images.unsplash.com/photo-1519455953755-af066f52f1a6?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
    ],
    available: true,
    features: [
      "Space/galaxy themed",
      "5 activity zones",
      "Dual slides",
      "Climbing wall",
    ],
    safetyNotes: "Adult supervision required at all times. Max 10 children.",
    colors: ["Dark Blue", "Purple", "Silver"],
  },
  {
    id: "dinosaur-bounce",
    companyId: "astro-jump-north-bay",
    name: "Dinosaur Stomp Bounce House",
    slug: "dinosaur-stomp-bounce-house",
    category: "Bounce Houses",
    themes: ["Dinosaur", "Jurassic", "Adventure", "T-Rex"],
    description:
      "ROAR into party time with this Jurassic-themed bounce house! Featuring T-Rex, Triceratops, Brachiosaurus, and Velociraptor graphics. Huge bounce area with an interior hoop for basketball. Kids will feel like they've stepped into a prehistoric adventure. A massive hit with dino fans!",
    dimensions: "16ft x 16ft x 14ft",
    capacity: 8,
    ageRange: "2–12 years",
    setupTime: 35,
    price: 189,
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
    ],
    available: true,
    features: [
      "Dinosaur themed artwork",
      "Interior basketball hoop",
      "Extra-large bounce area",
      "Safety mesh windows",
    ],
    safetyNotes:
      "Max 8 children. Do not allow children to jump into each other.",
    colors: ["Green", "Brown", "Orange"],
  },
  {
    id: "giant-slip-slide",
    companyId: "astro-jump-north-bay",
    name: "Giant Slip & Slide (40ft)",
    slug: "giant-slip-and-slide-40ft",
    category: "Water Slides",
    themes: ["Summer", "Water", "Outdoor", "Fun"],
    description:
      "The classic Slip & Slide, supersized! This 40-foot inflatable slip and slide is the perfect summer party centerpiece. Kids (and adults!) run and slide the full length into a splash pool. Features a continuous sprinkler strip to keep the surface wet and fast. No more tiny backyard slip slides — this is the real deal!",
    dimensions: "40ft long x 8ft wide",
    capacity: 1,
    ageRange: "4–17 years",
    setupTime: 30,
    price: 249,
    images: [
      "https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
    ],
    available: true,
    features: [
      "40ft giant slide",
      "Continuous sprinkler strip",
      "Inflatable splash pool",
      "One at a time for safety",
    ],
    safetyNotes:
      "One rider at a time. Run straight — no diving. Remove all jewelry and sharp objects.",
    colors: ["Blue", "Yellow"],
  },
];

export function getCompanyById(id: string): Company | undefined {
  return companies.find((c) => c.id === id);
}

export function getItemById(id: string): RentalItem | undefined {
  return rentalItems.find((i) => i.id === id);
}

export function getItemsByCompany(companyId: string): RentalItem[] {
  return rentalItems.filter((i) => i.companyId === companyId);
}

export function searchItems(query: string): RentalItem[] {
  const q = query.toLowerCase();
  return rentalItems.filter(
    (i) =>
      i.name.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q) ||
      i.themes.some((t) => t.toLowerCase().includes(q)) ||
      i.category.toLowerCase().includes(q) ||
      i.colors.some((c) => c.toLowerCase().includes(q))
  );
}

/**
 * Returns companies whose serviceArea includes the given city/zip string.
 * Matching is case-insensitive and checks if the input is contained in any
 * service area entry (so "palo alto" matches "East Palo Alto" and "Palo Alto").
 */
export function getCompaniesByLocation(cityOrZip: string): Company[] {
  const q = cityOrZip.toLowerCase().trim();
  if (!q) return companies;
  return companies.filter((c) =>
    c.serviceArea.some((area) => area.toLowerCase().includes(q) || q.includes(area.toLowerCase()))
  );
}

/**
 * Returns items available in a given city/zip, limited to companies that
 * serve that location.
 */
export function getItemsByLocation(cityOrZip: string): RentalItem[] {
  const servingCompanies = getCompaniesByLocation(cityOrZip).map((c) => c.id);
  return rentalItems.filter((i) => servingCompanies.includes(i.companyId));
}

export const categories = [
  { name: "Bounce Houses", icon: "🏰", count: rentalItems.filter((i) => i.category === "Bounce Houses").length },
  { name: "Water Slides", icon: "💦", count: rentalItems.filter((i) => i.category === "Water Slides").length },
  { name: "Combos", icon: "⭐", count: rentalItems.filter((i) => i.category === "Combos").length },
  { name: "Obstacle Courses", icon: "🏃", count: rentalItems.filter((i) => i.category === "Obstacle Courses").length },
  { name: "Concessions", icon: "🍿", count: rentalItems.filter((i) => i.category === "Concessions").length },
  { name: "Tents", icon: "⛺", count: rentalItems.filter((i) => i.category === "Tents").length },
  { name: "Tables & Chairs", icon: "🪑", count: rentalItems.filter((i) => i.category === "Tables & Chairs").length },
  { name: "Games", icon: "🎮", count: 0 },
];
