"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/Card";

import { Category } from "@/types/category";

import { PropertiesResponse } from "@/types/propertiesResponse";

const PAGE_SIZE = 6;

function toQueryNumber(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export default function BuyerPropertiesPage() {
  // Filter inputs.
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRooms, setMinRooms] = useState("");
  const [maxRooms, setMaxRooms] = useState("");

  const [sortBy, setSortBy] = useState<"name" | "price" | "rooms" | "city">("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  // Applied state.
  const [applied, setApplied] = useState(0);
  const [page, setPage] = useState(1);

  // Data.
  const [categories, setCategories] = useState<Category[]>([]);
  const [data, setData] = useState<PropertiesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Load categories once.
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetch("/api/categories", { credentials: "include" });
        const json = await res.json();
        if (!alive) return;

        setCategories(Array.isArray(json?.items) ? json.items : []);
      } catch {
        if (!alive) return;
        setCategories([]);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const queryUrl = useMemo(() => {
    const params = new URLSearchParams();

    if (name.trim()) params.set("name", name.trim());
    if (city.trim()) params.set("city", city.trim());
    if (categoryId) params.set("categoryId", String(toQueryNumber(categoryId)));

    const minP = toQueryNumber(minPrice);
    const maxP = toQueryNumber(maxPrice);
    const minR = toQueryNumber(minRooms);
    const maxR = toQueryNumber(maxRooms);

    if (minP !== undefined) params.set("minPrice", String(minP));
    if (maxP !== undefined) params.set("maxPrice", String(maxP));
    if (minR !== undefined) params.set("minRooms", String(minR));
    if (maxR !== undefined) params.set("maxRooms", String(maxR));

    params.set("sortBy", sortBy);
    params.set("order", order);

    params.set("page", String(page));
    params.set("pageSize", String(PAGE_SIZE));

    return `/api/properties?${params.toString()}`;
  }, [name, city, categoryId, minPrice, maxPrice, minRooms, maxRooms, sortBy, order, page]);

  async function fetchProperties() {
    setLoading(true);
    setErr(null);

    try {
      const res = await fetch(queryUrl, { credentials: "include" });
      const json = (await res.json()) as PropertiesResponse;

      if (!res.ok) {
        setErr((json as any)?.error || "Failed to load properties.");
        setData(null);
        return;
      }

      setData(json);
    } catch {
      setErr("Server error. Please try again.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  // Fetch when "applied" changes or page changes.
  useEffect(() => {
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applied, page]);

  function onApply() {
    setPage(1);
    setApplied((x) => x + 1);
  }

  function onReset() {
    setName("");
    setCity("");
    setCategoryId("");

    setMinPrice("");
    setMaxPrice("");
    setMinRooms("");
    setMaxRooms("");

    setSortBy("name");
    setOrder("asc");

    setPage(1);
    setApplied((x) => x + 1);
  }

  const total = data?.total ?? 0;
  const showingFrom = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(page * PAGE_SIZE, total);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#ff2d55]/15 blur-[120px]" />
        <div className="absolute -bottom-40 right-[-120px] h-[520px] w-[520px] rounded-full bg-sky-500/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_55%)]" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 pt-24 pb-14">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Properties.</h1>
          <p className="mt-2 text-white/70">
            Search, filter and sort listings. Results are paginated by 6 items per page.
          </p>
        </div>

        {/* Filters */}
        <section className="rounded-[26px] border border-white/10 bg-slate-900/40 backdrop-blur-xl p-6 shadow-[0_20px_70px_-35px_rgba(0,0,0,0.9)]">
          {/* Row 1 */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-4">
              <label className="mb-2 block text-sm text-white/70">Search by name.</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Modern Apartment"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none focus:border-[#ff2d55]/70 focus:ring-2 focus:ring-[#ff2d55]/20"
              />
            </div>

            <div className="col-span-12 sm:col-span-6 lg:col-span-2">
              <label className="mb-2 block text-sm text-white/70">City.</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Belgrade"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none focus:border-[#ff2d55]/70 focus:ring-2 focus:ring-[#ff2d55]/20"
              />
            </div>

            <div className="col-span-12 sm:col-span-6 lg:col-span-2">
              <label className="mb-2 block text-sm text-white/70">Category.</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none focus:border-[#ff2d55]/70 focus:ring-2 focus:ring-[#ff2d55]/20"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-6 lg:col-span-2">
              <label className="mb-2 block text-sm text-white/70">Sort by.</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none focus:border-[#ff2d55]/70 focus:ring-2 focus:ring-[#ff2d55]/20"
              >
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="rooms">Rooms</option>
                <option value="city">City</option>
              </select>
            </div>

            <div className="col-span-6 lg:col-span-2">
              <label className="mb-2 block text-sm text-white/70">Order.</label>
              <select
                value={order}
                onChange={(e) => setOrder(e.target.value as any)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none focus:border-[#ff2d55]/70 focus:ring-2 focus:ring-[#ff2d55]/20"
              >
                <option value="asc">Asc</option>
                <option value="desc">Desc</option>
              </select>
            </div>
          </div>

          {/* Row 2 */}
          <div className="mt-4 grid grid-cols-12 gap-4">
            <div className="col-span-12 sm:col-span-6 lg:col-span-3">
              <label className="mb-2 block text-sm text-white/70">Min price.</label>
              <input
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                inputMode="numeric"
                placeholder="e.g. 30"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none focus:border-[#ff2d55]/70 focus:ring-2 focus:ring-[#ff2d55]/20"
              />
            </div>

            <div className="col-span-12 sm:col-span-6 lg:col-span-3">
              <label className="mb-2 block text-sm text-white/70">Max price.</label>
              <input
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                inputMode="numeric"
                placeholder="e.g. 200"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none focus:border-[#ff2d55]/70 focus:ring-2 focus:ring-[#ff2d55]/20"
              />
            </div>

            <div className="col-span-12 sm:col-span-6 lg:col-span-3">
              <label className="mb-2 block text-sm text-white/70">Min rooms.</label>
              <input
                value={minRooms}
                onChange={(e) => setMinRooms(e.target.value)}
                inputMode="numeric"
                placeholder="e.g. 1"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none focus:border-[#ff2d55]/70 focus:ring-2 focus:ring-[#ff2d55]/20"
              />
            </div>

            <div className="col-span-12 sm:col-span-6 lg:col-span-3">
              <label className="mb-2 block text-sm text-white/70">Max rooms.</label>
              <input
                value={maxRooms}
                onChange={(e) => setMaxRooms(e.target.value)}
                inputMode="numeric"
                placeholder="e.g. 5"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none focus:border-[#ff2d55]/70 focus:ring-2 focus:ring-[#ff2d55]/20"
              />
            </div>
          </div>

          {/* Footer row */}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-white/60">
              {loading
                ? "Loading..."
                : `Showing ${showingFrom}-${showingTo} of ${total} results.`}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onReset}
                className="rounded-2xl border border-white/15 bg-white/5 px-5 py-2.5 font-semibold text-white hover:bg-white/10"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={onApply}
                className="rounded-2xl bg-[#ff2d55] px-6 py-2.5 font-semibold text-white shadow-lg shadow-[#ff2d55]/25 hover:opacity-95"
              >
                Apply
              </button>
            </div>
          </div>
        </section>

        {/* Error */}
        {err ? (
          <div className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {err}
          </div>
        ) : null}

        {/* Cards */}
        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div
                key={i}
                className="h-[340px] rounded-[22px] border border-white/10 bg-white/5 animate-pulse"
              />
            ))
          ) : data?.items?.length ? (
            data.items.map((p) => (
              <Card
                key={p.id}
                title={p.name}
                imageUrl={p.image}
                subtitle={`${p.location.city} - ${p.location.address}`}
                metaLeft={`${p.rooms} rooms`}
                priceText={`€${p.price}/night`}
                metaRight={p.category.name}
                badge={p.category.name}
                onDetailsClick={() => {}}
              />
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
              No properties found for selected filters.
            </div>
          )}
        </section>

        {/* Pagination */}
        <div className="mt-10 flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 font-semibold text-white disabled:opacity-40 hover:bg-white/10"
          >
            Prev
          </button>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
            Page <span className="font-semibold text-white">{page}</span> of{" "}
            <span className="font-semibold text-white">{totalPages}</span>
          </div>

          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 font-semibold text-white disabled:opacity-40 hover:bg-white/10"
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
}
