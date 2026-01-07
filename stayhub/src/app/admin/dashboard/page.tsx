"use client";
import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  Legend,
} from "recharts";

import type { AdminMetrics } from "@/types/adminMetrics";

function toNumber(v: unknown) {
  const n = typeof v === "string" ? Number(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? n : 0;
}

function eur(v: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);

        // Ako ti je ruta drugačija, samo promeni ovde.
        const res = await fetch("/api/admin/metrics", {
          credentials: "include",
          cache: "no-store",
        });

        const data = (await res.json().catch(() => null)) as AdminMetrics | null;

        if (!alive) return;

        if (!res.ok || !data) {
          setMetrics(null);
          return;
        }

        setMetrics(data);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const sellerBarData = useMemo(() => {
    const list = metrics?.reservationsPerSeller ?? [];
    // Sort desc, uzmi top 10.
    return [...list]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((x) => ({ sellerName: x.sellerName, count: x.count }));
  }, [metrics]);

  const revenueLineData = useMemo(() => {
    const list = metrics?.revenueByMonth ?? [];
    return list.map((x) => ({
      month: x.month,
      revenue: toNumber(x.revenue),
    }));
  }, [metrics]);

  const totalRevenue = useMemo(() => revenueLineData.reduce((sum, x) => sum + toNumber(x.revenue), 0), [revenueLineData]);

  const kpi = useMemo(() => {
    return {
      totalReservations: metrics?.totalReservations ?? 0,
      totalRevenue,
      activeMonths: revenueLineData.length,
      sellersTracked: metrics?.reservationsPerSeller?.length ?? 0,
    };
  }, [metrics, totalRevenue, revenueLineData.length]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#ff2d55]/15 blur-[120px]" />
        <div className="absolute -bottom-40 right-[-120px] h-[520px] w-[520px] rounded-full bg-sky-500/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_55%)]" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 pt-10 pb-16">
        {/* Header */}
        <section className="rounded-[28px] border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-[0_20px_70px_-35px_rgba(0,0,0,0.9)]">
          <div className="p-7 md:p-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>

                <h1 className="mt-4 text-4xl font-semibold tracking-tight">Dashboard.</h1>
              </div>

              <div className="flex flex-wrap gap-3">

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center justify-center rounded-2xl bg-[#ff2d55] px-6 py-3 font-semibold text-white shadow-lg shadow-[#ff2d55]/25 hover:opacity-95"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* KPIs */}
        <section className="mt-8 grid gap-4 md:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[106px] rounded-[22px] border border-white/10 bg-white/5 animate-pulse" />
            ))
          ) : (
            <>
              <div className="rounded-[22px] border border-white/10 bg-slate-900/35 p-6 backdrop-blur">
                <p className="text-xs text-white/60">Total reservations</p>
                <p className="mt-2 text-2xl font-semibold">{kpi.totalReservations}</p>
                <p className="mt-1 text-xs text-white/55">All time.</p>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-slate-900/35 p-6 backdrop-blur">
                <p className="text-xs text-white/60">Total revenue</p>
                <p className="mt-2 text-2xl font-semibold">{eur(kpi.totalRevenue)}</p>
                <p className="mt-1 text-xs text-white/55">Sum by months.</p>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-slate-900/35 p-6 backdrop-blur">
                <p className="text-xs text-white/60">Months tracked</p>
                <p className="mt-2 text-2xl font-semibold">{kpi.activeMonths}</p>
                <p className="mt-1 text-xs text-white/55">Revenue series.</p>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-slate-900/35 p-6 backdrop-blur">
                <p className="text-xs text-white/60">Sellers tracked</p>
                <p className="mt-2 text-2xl font-semibold">{kpi.sellersTracked}</p>
                <p className="mt-1 text-xs text-white/55">Reservation aggregation.</p>
              </div>
            </>
          )}
        </section>

        {/* Charts */}
        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          {/* Revenue by month */}
          <div className="rounded-[22px] border border-white/10 bg-slate-900/35 p-6 backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Revenue by month.</h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                Line chart
              </div>
            </div>

            <div className="mt-5 h-[320px]">
              {loading ? (
                <div className="h-full w-full rounded-2xl border border-white/10 bg-white/5 animate-pulse" />
              ) : revenueLineData.length === 0 ? (
                <div className="grid h-full place-items-center rounded-2xl border border-white/10 bg-white/5 text-white/70">
                  Nema podataka za revenue by month.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueLineData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeOpacity={0.15} />
                    <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(15,23,42,0.92)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 14,
                        color: "white",
                      }}
                      formatter={(value: any) => eur(toNumber(value))}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke="#ff2d55"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Reservations per seller */}
          <div className="rounded-[22px] border border-white/10 bg-slate-900/35 p-6 backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Top sellers by reservations.</h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                Bar chart
              </div>
            </div>

            <div className="mt-5 h-[320px]">
              {loading ? (
                <div className="h-full w-full rounded-2xl border border-white/10 bg-white/5 animate-pulse" />
              ) : sellerBarData.length === 0 ? (
                <div className="grid h-full place-items-center rounded-2xl border border-white/10 bg-white/5 text-white/70">
                  Nema podataka za reservations per seller.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sellerBarData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeOpacity={0.15} />
                    <XAxis
                      dataKey="sellerName"
                      tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(15,23,42,0.92)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 14,
                        color: "white",
                      }}
                    />
                    <Bar dataKey="count" name="Reservations" fill="#ff2d55" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </section>

        {/* Fallback state */}
        {!loading && !metrics ? (
          <section className="mt-8 rounded-[22px] border border-white/10 bg-slate-900/35 p-8 backdrop-blur">
            <h2 className="text-xl font-semibold">Nema metrika.</h2>
            <p className="mt-2 text-white/70">
              Ili nema podataka, ili nemaš pristup (ADMIN), ili je ruta drugačija od <span className="font-semibold">/api/admin/metrics</span>.
            </p>
          </section>
        ) : null}
      </div>
    </main>
  );
}
