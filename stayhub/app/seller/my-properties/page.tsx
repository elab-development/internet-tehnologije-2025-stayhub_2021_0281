"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Card from "@/client/components/Card";

import type { PropertyItem } from "@/client/types/propertyItem";
import type { PropertiesResponse } from "@/client/types/propertiesResponse";

function money(v: string | number) {
  const n = typeof v === "string" ? Number(v) : v;
  if (!Number.isFinite(n)) return "€—";
  return `€${n.toFixed(0)}`;
}

export default function SellerMyPropertiesPage() {
  const router = useRouter();
  const [items, setItems] = useState<PropertyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);

        const res = await fetch(
          "/api/properties?mine=1&page=1&pageSize=50&sortBy=name&order=asc",
          {
            credentials: "include",
            cache: "no-store",
          }
        );

        const data = (await res.json().catch(() => null)) as PropertiesResponse | null;

        if (!res.ok || !data?.items || !Array.isArray(data.items)) {
          if (alive) setItems([]);
          return;
        }

        if (alive) setItems(data.items);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const headerText = useMemo(() => {
    if (loading) return "Loading…";
    return "My properties";
  }, [loading]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#ff2d55]/15 blur-[120px]" />
        <div className="absolute -bottom-40 right-[-120px] h-[520px] w-[520px] rounded-full bg-sky-500/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_55%)]" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 pt-24 pb-16">
        <section className="rounded-[28px] border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-[0_20px_70px_-35px_rgba(0,0,0,0.9)]">
          <div className="p-7 md:p-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>

                <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                  {headerText}
                </h1>

                <p className="mt-3 max-w-2xl text-white/70">
                  Manage your listings, check details and keep everything up to date.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">

                <button
                  type="button"
                  onClick={() => {}}
                  className="inline-flex items-center justify-center rounded-2xl bg-[#ff2d55] px-6 py-3 font-semibold text-white shadow-lg shadow-[#ff2d55]/25 hover:opacity-95"
                >
                  Add new property
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[320px] rounded-[22px] border border-white/10 bg-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-[22px] border border-white/10 bg-slate-900/35 p-8 backdrop-blur">
              <h2 className="text-xl font-semibold">No properties yet.</h2>
              <p className="mt-2 text-white/70">
                You haven’t created any listings yet. Add your first property to start getting reservations.
              </p>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => {}}
                  className="inline-flex items-center justify-center rounded-2xl bg-[#ff2d55] px-6 py-3 font-semibold text-white shadow-lg shadow-[#ff2d55]/25 hover:opacity-95"
                >
                  Add new property
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => (
                <Card
                  key={p.id}
                  title={p.name}
                  subtitle={p.description}
                  imageUrl={p.image}
                  badge={p.category?.name ?? "Property"}
                  priceText={money(p.price)}
                  metaLeft={p.location?.city ?? "—"}
                  metaRight={`${p.rooms} rooms`}
                  onDetailsClick={() => {
                    if (!p.id) return;
                    router.push(`/seller/property-details?id=${encodeURIComponent(String(p.id))}`);
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
