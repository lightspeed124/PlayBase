"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getFavorites } from "@/lib/favorites";
import type { RentalItem } from "@/types";

export default function FavouritesRow() {
  const [items, setItems] = useState<RentalItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const ids = getFavorites();
    if (ids.length === 0) { setLoaded(true); return; }

    fetch(`/api/listings?ids=${ids.join(",")}`)
      .then((r) => r.json())
      .then((data: RentalItem[]) => {
        const ordered = ids
          .map((id) => data.find((d) => String(d.listing_id) === id))
          .filter(Boolean) as RentalItem[];
        setItems(ordered);
      })
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded || items.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-red-500 text-xl">♥</span>
          <h2 className="text-xl font-bold text-gray-900">Your Saved Items</h2>
          <span className="text-sm text-gray-400 font-medium">({items.length})</span>
        </div>
        <Link href="/favorites" className="text-sm text-gray-400 hover:text-gray-700 font-medium transition-colors shrink-0">
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.slice(0, 6).map((item) => (
          <Link
            key={item.listing_id}
            href={`/items/${item.listing_id}`}
            className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-3 hover:shadow-md transition-shadow group"
          >
            {/* Thumbnail */}
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
              {item.primary_image_url ? (
                <Image
                  src={item.primary_image_url}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="80px"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">🎪</div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 mb-0.5">{item.category_name}</p>
              <h3 className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-brand-blue transition-colors line-clamp-2">
                {item.title}
              </h3>
              <p className="text-xs text-gray-400 mt-1">{item.business_name}</p>
            </div>

            {/* Price */}
            <div className="text-right shrink-0">
              {item.base_price_amount != null ? (
                <>
                  <div className="text-base font-bold text-gray-900">${Math.round(item.base_price_amount)}</div>
                  <div className="text-xs text-gray-400">/ day</div>
                </>
              ) : (
                <div className="text-sm text-gray-400">Call</div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
