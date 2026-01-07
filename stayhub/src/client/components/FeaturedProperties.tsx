"use client";

import Link from "next/link";
import Card from "@/components/Card";

import type { FeaturedItem } from "@/types/featuredItem";

type FeaturedPropertiesProps = {
  items: FeaturedItem[];
};

export default function FeaturedProperties({ items }: FeaturedPropertiesProps) {
  if (!items || items.length === 0) {
    return (
      <section className="mt-12">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/35 p-8 backdrop-blur">
          <h2 className="text-2xl font-semibold tracking-tight text-white">Featured properties.</h2>
          <p className="mt-2 text-white/70">
            No featured properties yet. Try exploring all listings.
          </p>

          <div className="mt-6">
            <Link
              href="/buyer/properties"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-[#ff2d55] px-6 py-3 font-semibold text-white shadow-lg shadow-[#ff2d55]/25 hover:opacity-95 md:w-auto"
            >
              Browse properties
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">Featured properties.</h2>
          <p className="mt-2 text-white/70">A curated selection you can book right now.</p>
        </div>

        <Link
          href="/buyer/properties"
          className="hidden md:inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 font-semibold text-white hover:bg-white/10"
        >
          View all
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <Card
            key={p.id}
            title={p.name}
            subtitle={`${p.location?.city ?? "—"} • ${p.location?.address ?? "—"}`}
            imageUrl={p.image}
            priceText={`€${Number(p.price).toFixed(0)}`}
            badge={p.category?.name ?? "Property"}
            metaLeft={`${p.rooms} rooms`}
            metaRight={p.seller?.name ?? "—"}
            onDetailsClick={() => {
            }}
          />
        ))}
      </div>

      <div className="mt-6 md:hidden">
        <Link
          href="/buyer/properties"
          className="inline-flex w-full items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 py-3 font-semibold text-white hover:bg-white/10"
        >
          View all properties
        </Link>
      </div>
    </section>
  );
}
