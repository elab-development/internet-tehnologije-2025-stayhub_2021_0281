"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { ReservationStatus } from "@/types/reservationStatus";
import type { SellerReservationItem } from "@/types/sellerReservationItem";
import type { SellerReservationsResponse } from "@/types/sellerReservationsResponse";

function safeDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDate(iso: string) {
  const d = safeDate(iso);
  if (!d) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function nightsBetween(startIso: string, endIso: string) {
  const s = safeDate(startIso);
  const e = safeDate(endIso);
  if (!s || !e) return 0;
  const ms = e.getTime() - s.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function money(v: string | number) {
  const n = typeof v === "string" ? Number(v) : v;
  if (!Number.isFinite(n)) return "€—";
  return `€${n.toFixed(0)}`;
}

function statusLabel(s: ReservationStatus) {
  if (s === "PENDING") return "Pending";
  if (s === "CONFIRMED") return "Confirmed";
  return "Cancelled";
}

function statusBadgeClass(s: ReservationStatus) {
  if (s === "CONFIRMED") return "border-emerald-400/30 bg-emerald-500/10 text-emerald-100";
  if (s === "CANCELLED") return "border-rose-400/30 bg-rose-500/10 text-rose-100";
  return "border-amber-400/30 bg-amber-500/10 text-amber-100";
}

const ALL_STATUSES: ReservationStatus[] = ["PENDING", "CONFIRMED", "CANCELLED"];

export default function SellerManageReservationsPage() {
  const [items, setItems] = useState<SellerReservationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);

        // POSTOJEĆA seller ruta:
        const res = await fetch("/api/seller/reservations", {
          credentials: "include",
        });

        const data = (await res.json().catch(() => null)) as SellerReservationsResponse | null;

        if (!alive) return;

        if (!res.ok || !data?.items || !Array.isArray(data.items)) {
          setItems([]);
          return;
        }

        setItems(data.items);
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
    return "Manage reservations";
  }, [loading]);

  async function updateStatus(reservationId: number, status: ReservationStatus) {
    try {
      setBusyId(reservationId);

      const res = await fetch(`/api/seller/reservations/${reservationId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        // Ne prikazujemo "failed", samo ne menjamo stanje.
        return;
      }

      setItems((prev) =>
        prev.map((r) => (r.id === reservationId ? { ...r, status } : r))
      );
    } finally {
      setBusyId(null);
    }
  }

  async function deleteReservation(reservationId: number) {
    const ok = window.confirm("Da li si sigurna da želiš da obrišeš ovu rezervaciju?");
    if (!ok) return;

    try {
      setBusyId(reservationId);

      // OVO traži DELETE rutu (dole ti je kod).
      const res = await fetch(`/api/seller/reservations/${reservationId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        return;
      }

      setItems((prev) => prev.filter((r) => r.id !== reservationId));
    } finally {
      setBusyId(null);
    }
  }

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
                  Ovde vidiš sve rezervacije za tvoje nekretnine i možeš da menjaš njihov status ili da ih obrišeš.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/seller/my-properties"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10"
                >
                  My properties
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="mt-10">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[190px] rounded-[22px] border border-white/10 bg-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-[22px] border border-white/10 bg-slate-900/35 p-8 backdrop-blur">
              <h2 className="text-xl font-semibold">Nema rezervacija.</h2>
              <p className="mt-2 text-white/70">
                Trenutno ne postoji ni jedna rezervacija vezana za tvoje nekretnine.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {items.map((r) => {
                const nights = nightsBetween(r.startDate, r.endDate);

                const propName = r.property?.name ?? `Property #${r.property?.id ?? "—"}`;
                const city = r.property?.location?.city ?? "—";
                const category = r.property?.category?.name ?? "—";

                const buyerName = r.user?.name ?? "—";
                const buyerEmail = r.user?.email ?? "—";

                const busy = busyId === r.id;

                return (
                  <div
                    key={r.id}
                    className="rounded-[22px] border border-white/10 bg-slate-900/35 p-6 backdrop-blur transition hover:bg-slate-900/50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs text-white/60">Reservation #{r.id}</p>
                        <h3 className="mt-1 truncate text-lg font-semibold">{propName}</h3>
                        <p className="mt-2 text-sm text-white/70">
                          {city} • {category}
                        </p>
                      </div>

                      <div className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${statusBadgeClass(r.status)}`}>
                        {statusLabel(r.status)}
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs text-white/60">Dates</p>
                        <p className="mt-1 text-sm font-semibold">
                          {formatDate(r.startDate)} → {formatDate(r.endDate)}
                        </p>
                        <p className="mt-1 text-xs text-white/60">{nights} night(s)</p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs text-white/60">Total price</p>
                        <p className="mt-1 text-sm font-semibold">{money(r.totalPrice)}</p>
                        <p className="mt-1 text-xs text-white/60">Auto calculated</p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs text-white/60">Buyer</p>
                      <p className="mt-1 text-sm font-semibold">{buyerName}</p>
                      <p className="mt-1 text-xs text-white/60">{buyerEmail}</p>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-white/60">Status:</label>
                        <select
                          value={r.status}
                          disabled={busy}
                          onChange={(e) => updateStatus(r.id, e.target.value as ReservationStatus)}
                          className="rounded-xl border border-white/15 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none focus:border-[#ff2d55]/70 focus:ring-2 focus:ring-[#ff2d55]/20 disabled:opacity-60"
                        >
                          {ALL_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {statusLabel(s)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => deleteReservation(r.id)}
                        className="ml-auto inline-flex items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-2.5 text-sm font-semibold text-rose-100 hover:bg-rose-500/15 disabled:opacity-60"
                      >
                        Delete
                      </button>
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
