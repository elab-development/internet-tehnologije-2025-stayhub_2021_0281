"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import L from "leaflet";

type PropertyDTO = {
  id: number;
  name: string;
  description: string;
  image: string;
  price: string | number;
  rooms: number;
  location?: { address: string; city: string };
  category?: { name: string; description: string };
};

type Coords = { lat: number; lon: number };

function money(v: string | number) {
  const n = typeof v === "string" ? Number(v) : v;
  if (!Number.isFinite(n)) return "€—";
  return `€${n.toFixed(0)}`;
}

function buildPannellumEmbedUrl(panoramaUrl: string) {
  return `https://cdn.pannellum.org/2.5/pannellum.htm#panorama=${encodeURIComponent(
    panoramaUrl
  )}&autoLoad=true`;
}

async function geocode(q: string): Promise<Coords | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
    q
  )}`;

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return null;

  const data = (await res.json()) as Array<{ lat: string; lon: string }>;
  if (!data?.length) return null;

  const lat = Number(data[0].lat);
  const lon = Number(data[0].lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  return { lat, lon };
}

/**
 * ✅ IMPORTANT:
 * Some Next.js + TS setups lose react-leaflet prop typing when using dynamic().
 * The simplest fix is to keep the dynamic import (SSR false) and type these as `any`.
 * This removes the "center/url/icon does not exist" squiggles.
 */
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
) as any;

const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
) as any;

const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), {
  ssr: false,
}) as any;

const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), {
  ssr: false,
}) as any;

// ✅ Fix Leaflet marker icon in Next.js builds
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function SellerPropertyDetailsPage() {
  const sp = useSearchParams();

  const idStr = (sp.get("id") ?? "").trim();
  const id = /^\d+$/.test(idStr) ? Number(idStr) : NaN;

  const [property, setProperty] = useState<PropertyDTO | null>(null);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [loading, setLoading] = useState(true);
  const [geoLoading, setGeoLoading] = useState(false);
  const [error, setError] = useState("");

  const random360Url = useMemo(() => {
    const options = [
      "https://pannellum.org/images/alma.jpg",
      "https://pannellum.org/images/bma-0.jpg",
      "https://pannellum.org/images/cerro-toco-0.jpg",
      "https://pannellum.org/images/from-tree.jpg",
    ];
    return options[Math.floor(Math.random() * options.length)];
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      setProperty(null);
      setCoords(null);

      if (!Number.isInteger(id) || id <= 0) {
        setLoading(false);
        setError("Missing/invalid id in URL (expected ?id=14).");
        return;
      }

      try {
        const res = await fetch(`/api/properties/${id}`, {
          cache: "no-store",
          credentials: "include",
        });

        const json = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(json?.message || `API error (HTTP ${res.status}).`);
        }

        const item = (json?.data ?? json) as PropertyDTO;
        if (!cancelled) setProperty(item);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load property.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    async function loadCoords() {
      if (!property?.location?.address || !property?.location?.city) return;

      setGeoLoading(true);
      try {
        const q = `${property.location.address}, ${property.location.city}`;
        const found = await geocode(q);
        if (!cancelled) setCoords(found);
      } finally {
        if (!cancelled) setGeoLoading(false);
      }
    }

    loadCoords();
    return () => {
      cancelled = true;
    };
  }, [property]);

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
        <div className="relative mx-auto w-full max-w-6xl px-4 pt-24 pb-16">
          <h1 className="text-4xl font-semibold">Property details</h1>
          <p className="mt-4 text-white/70">Loading…</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
        <div className="relative mx-auto w-full max-w-6xl px-4 pt-24 pb-16">
          <h1 className="text-4xl font-semibold">Property details</h1>
          <p className="mt-4 text-red-400">{error}</p>
          <p className="mt-2 text-white/60">
            Current URL param: <code className="text-white">{idStr || "(empty)"}</code>
          </p>
        </div>
      </main>
    );
  }

  if (!property) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
        <div className="relative mx-auto w-full max-w-6xl px-4 pt-24 pb-16">
          <h1 className="text-4xl font-semibold">Property details</h1>
          <p className="mt-4 text-white/70">Not found.</p>
        </div>
      </main>
    );
  }

  const locationText = property.location
    ? `${property.location.address}, ${property.location.city}`
    : "N/A";

  const categoryName = property.category?.name ?? "N/A";
  const pannellumUrl = buildPannellumEmbedUrl(random360Url);

  // ✅ Use a strict tuple for leaflet position
  const center = coords ? ([coords.lat, coords.lon] as [number, number]) : null;

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
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {property.name}
            </h1>

            <div className="mt-4 grid gap-2 text-white/80 md:grid-cols-2">
              <div>
                <span className="text-white/60">Price:</span>{" "}
                <span className="font-semibold text-white">{money(property.price)}</span>
              </div>
              <div>
                <span className="text-white/60">Rooms:</span>{" "}
                <span className="font-semibold text-white">{property.rooms}</span>
              </div>
              <div>
                <span className="text-white/60">Category:</span>{" "}
                <span className="font-semibold text-white">{categoryName}</span>
              </div>
              <div>
                <span className="text-white/60">Location:</span>{" "}
                <span className="font-semibold text-white">{locationText}</span>
              </div>
            </div>

            <p className="mt-5 max-w-3xl text-white/70">{property.description}</p>

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <img
                src={property.image}
                alt={property.name}
                className="h-[340px] w-full object-cover md:h-[420px]"
              />
            </div>
          </div>
        </section>

        <div className="mt-10 grid gap-6">
          {/* MAP WITH POPUP */}
          <section className="overflow-hidden rounded-[22px] border border-white/10 bg-slate-900/35 backdrop-blur">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold">Map (OSM)</h2>
                <p className="mt-1 text-sm text-white/60">
                  {geoLoading ? "Finding coordinates…" : "Click the marker to see details."}
                </p>
              </div>
              <a
                className="text-sm font-semibold text-white/80 hover:text-white"
                href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(
                  locationText
                )}`}
                target="_blank"
                rel="noreferrer"
              >
                Open in OSM →
              </a>
            </div>

            {center ? (
              <div style={{ height: 420, width: "100%" }}>
                <MapContainer
                  center={center}
                  zoom={15}
                  scrollWheelZoom={false}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    // if your TS still complains in your setup, this file keeps it working anyway
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <Marker position={center} icon={markerIcon}>
                    <Popup>
                      <div style={{ minWidth: 220 }}>
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>
                          {property.name}
                        </div>

                        <div style={{ marginBottom: 6 }}>
                          <div>
                            <strong>Category:</strong> {categoryName}
                          </div>
                          <div>
                            <strong>Price:</strong> {money(property.price)}
                          </div>
                          <div>
                            <strong>Rooms:</strong> {property.rooms}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontWeight: 600, marginBottom: 2 }}>Location</div>
                          <div>{property.location?.address ?? "—"}</div>
                          <div>{property.location?.city ?? "—"}</div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            ) : (
              <div className="px-6 py-6 text-white/70">
                No exact coordinates found for this address.
              </div>
            )}
          </section>

          {/* 360 */}
          <section className="overflow-hidden rounded-[22px] border border-white/10 bg-slate-900/35 backdrop-blur">
            <div className="border-b border-white/10 px-6 py-4">
              <h2 className="text-lg font-semibold">360° View (Pannellum)</h2>
              <p className="mt-1 text-sm text-white/60">Random panorama preview.</p>
            </div>

            <iframe
              title="Pannellum 360"
              src={pannellumUrl}
              style={{ width: "100%", height: 520, border: 0 }}
              loading="lazy"
              allow="fullscreen"
            />
          </section>
        </div>
      </div>
    </main>
  );
}

