import Link from "next/link";

export default function CTABanner() {
  return (
    <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand-blue to-brand-blue-dark px-6 py-12 sm:px-12 sm:py-16 text-center">
      {/* Decorative background circles */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/5 rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
          Ready to Make Your Event Unforgettable?
        </h2>
        <p className="text-white/70 text-sm sm:text-base mt-3 max-w-lg mx-auto">
          Browse hundreds of inflatables, compare prices from local vendors, and book the perfect rental — all in one place.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link
            href="/browse"
            className="bg-white text-brand-blue font-bold text-sm sm:text-base px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Browse All Rentals
          </Link>
          <Link
            href="/plan"
            className="inline-flex items-center gap-2 text-white/90 font-semibold text-sm sm:text-base px-8 py-3.5 rounded-full border border-white/25 hover:bg-white/10 active:scale-[0.98] transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
            </svg>
            Help Me Choose
          </Link>
        </div>
      </div>
    </section>
  );
}
