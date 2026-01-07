"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { ReservationItem } from "@/types/reservationItem";
import type { ReservationStatus } from "@/types/reservationStatus";

type ApiResponse = { items?: ReservationItem[]; error?: string };

function safeDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDate(iso: string) {
  const d = safeDate(iso);
  if (!d) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function nightsBetween(startIso: string, endIso: string) {
  const s = safeDate(startIso);
  const e = safeDate(endIso);
  if (!s || !e) return 0;
  const ms = e.getTime() - s.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function statusLabel(s: ReservationStatus) {
  if (s === "PENDING") return "Pending";
  if (s === "CONFIRMED") return "Confirmed";
  return "Cancelled";
}

function statusBadgeClass(s: ReservationStatus) {
  if (s === "CONFIRMED")
    return "border-emerald-400/30 bg-emerald-500/10 text-emerald-100";
  if (s === "CANCELLED")
    return "border-rose-400/30 bg-rose-500/10 text-rose-100";
  return "border-amber-400/30 bg-amber-500/10 text-amber-100";
}

export default function MyReservationsPage() {
  const [items, setItems] = useState<ReservationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/reservations/my", {
          credentials: "include",
        });

        // Ako nije ok (npr 401/403), ne prikazujemo error – samo kao da nema rezervacija.
        if (!res.ok) {
          if (alive) setItems([]);
          return;
        }

        const data: ApiResponse = await res.json().catch(() => ({}));
        const list = Array.isArray(data.items) ? data.items : [];

        if (alive) setItems(list);
      } catch {
        // Ako pukne fetch – opet tretiramo kao da nema rezervacija.
        if (alive) setItems([]);
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
    return "My reservations";
  }, [loading]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#ff2d55]/15 blur-[120px]" />
        <div className="absolute -bottom-40 right-[-120px] h-[520px] w-[520px] rounded-full bg-sky-500/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_55%)]" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 pt-24 pb-16">
        {/* Header */}
        <section className="rounded-[28px] border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-[0_20px_70px_-35px_rgba(0,0,0,0.9)]">
          <div className="p-7 md:p-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>

                <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                  {headerText}
                </h1>

                <p className="mt-3 max-w-2xl text-white/70">
                  See your booking history, dates, total price and current status in one place.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Content */}
        <section className="mt-10">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[160px] rounded-[22px] border border-white/10 bg-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-[22px] border border-white/10 bg-slate-900/35 p-8 backdrop-blur">
              <h2 className="text-xl font-semibold">No reservations yet.</h2>
              <p className="mt-2 text-white/70">
                You currently don&apos;t have any reservations. Browse properties and book your first stay.
              </p>

              <div className="mt-6">
                <Link
                  href="/buyer/properties"
                  className="inline-flex items-center justify-center rounded-2xl bg-[#ff2d55] px-6 py-3 font-semibold text-white shadow-lg shadow-[#ff2d55]/25 hover:opacity-95"
                >
                  Browse properties
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {items.map((r) => {
                const nights = nightsBetween(r.startDate, r.endDate);
                const propName =
                  r.property?.name || `Property #${r.property?.id ?? r.id}`;
                const city = r.property?.location?.city || "—";
                const address = r.property?.location?.address || "—";
                const category = r.property?.category?.name || "—";
                const seller = r.property?.seller?.name || "—";

                return (
                  <div
                    key={r.id}
                    className="group rounded-[22px] border border-white/10 bg-slate-900/35 p-6 backdrop-blur transition hover:bg-slate-900/50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs text-white/60">
                          Reservation #{r.id}
                        </p>
                        <h3 className="mt-1 text-lg font-semibold">{propName}</h3>
                        <p className="mt-2 text-sm text-white/70">
                          {city} • {category}
                        </p>
                      </div>

                      <div
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusBadgeClass(
                          r.status
                        )}`}
                      >
                        {statusLabel(r.status)}
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs text-white/60">Dates</p>
                        <p className="mt-1 text-sm font-semibold">
                          {formatDate(r.startDate)} → {formatDate(r.endDate)}
                        </p>
                        <p className="mt-1 text-xs text-white/60">
                          {nights} night(s)
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs text-white/60">Total price</p>
                        <p className="mt-1 text-sm font-semibold">
                          {String(r.totalPrice)} €
                        </p>
                        <p className="mt-1 text-xs text-white/60">
                          Auto calculated
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs text-white/60">Address</p>
                      <p className="mt-1 text-sm text-white/80">{address}</p>
                      <p className="mt-1 text-xs text-white/60">
                        Seller: {seller}
                      </p>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {}}
                        className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
                      >
                        Details
                      </button>

                      <span className="text-xs text-white/50">
                        Cancellation rules are applied on the backend.
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
