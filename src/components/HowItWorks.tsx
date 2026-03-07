const STEPS = [
  {
    step: "1",
    title: "Browse or Get a Recommendation",
    desc: "Explore rentals by category — or tell us about your event and we\u2019ll suggest the perfect fit.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    ),
  },
  {
    step: "2",
    title: "Pick Your Favorite & Request",
    desc: "Love something? Submit a booking request in seconds — no account needed.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
      </svg>
    ),
  },
  {
    step: "3",
    title: "Confirmed & Delivered",
    desc: "Booking confirmed shortly. The vendor delivers, sets up, and picks up — you just enjoy the party.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section>
      {/* Section header */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>

      {/* Steps — horizontal cards on all screens, 3-col on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STEPS.map((s) => (
          <div
            key={s.step}
            className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-gray-50/60 p-4 sm:p-5"
          >
            {/* Numbered icon */}
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-xl bg-brand-blue-subtle flex items-center justify-center text-brand-blue">
                {s.icon}
              </div>
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-brand-blue text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                {s.step}
              </span>
            </div>

            {/* Text */}
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-gray-900 leading-snug">{s.title}</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
