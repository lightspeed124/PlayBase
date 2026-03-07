"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "What's included with the rental?",
    a: "Every rental includes delivery, professional setup, and pickup. Inflatables come with a blower to keep them inflated during your event. Some vendors also include stakes, tarps, and extension cords — check the listing details for specifics.",
  },
  {
    q: "How far in advance should I book?",
    a: "We recommend booking at least 1–2 weeks ahead, especially during peak season (April–October). Popular items like water slides and combo bouncers sell out fast on weekends. Last-minute bookings may be available depending on vendor availability.",
  },
  {
    q: "Do I need a power outlet nearby?",
    a: "Yes, most inflatables require a standard 110V outlet within 50–100 feet. The blower needs to run continuously to keep the unit inflated. If you don't have access to power, ask the vendor about generator rental options.",
  },
  {
    q: "What happens if it rains on my event day?",
    a: "Policies vary by vendor, but most offer free rescheduling or a full refund for weather cancellations. Check the vendor's cancellation policy on the listing page, and always reach out early if the forecast looks bad.",
  },
  {
    q: "Is there a weight or age limit?",
    a: "Each inflatable has its own weight and capacity limits listed on the detail page. Toddler units are designed for kids under 6, while larger bounce houses and obstacle courses can handle older kids and even adults. Always follow the posted guidelines for safety.",
  },
  {
    q: "Who supervises the inflatable during the event?",
    a: "You're responsible for supervising during your event. We recommend having at least one adult monitor the inflatable at all times. Some vendors offer attendant services for an additional fee — look for it in the listing extras.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
        <p className="text-gray-500 text-sm mt-2">Everything you need to know before booking</p>
      </div>

      <div className="max-w-3xl mx-auto divide-y divide-gray-100">
        {FAQS.map((faq, i) => {
          const isOpen = open === i;
          return (
            <div key={i}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between py-5 text-left gap-4 group cursor-pointer"
              >
                <span className="font-semibold text-gray-900 text-[15px] group-hover:text-brand-blue transition-colors">
                  {faq.q}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  isOpen ? "max-h-60 pb-5" : "max-h-0"
                }`}
              >
                <p className="text-sm text-gray-500 leading-relaxed pr-10">{faq.a}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
