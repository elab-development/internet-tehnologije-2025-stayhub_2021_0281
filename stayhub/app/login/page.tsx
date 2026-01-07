"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import type { MeResponse } from "@/client/types/meReponse";

function routeByRole(role?: string) {
  const r = (role ?? "").toUpperCase();
  if (r === "SELLER") return "/seller/home";
  if (r === "ADMIN") return "/admin/home";
  return "/buyer/home";
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1) Login (cookie se postavlja ovde).
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "Neuspešna prijava.");
        return;
      }

      // 2) Uvek uzmi role iz /api/auth/me (najpouzdanije).
      const meRes = await fetch("/api/auth/me", { credentials: "include" });
      const meJson: MeResponse = await meRes.json().catch(() => ({ user: null }));

      const role = meJson?.user?.userRole;
      const target = routeByRole(role);

      router.push(target);
      router.refresh();
    } catch {
      setError("Greška na serveru. Pokušaj ponovo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-slate-950">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center">
          <div className="relative h-28 w-64">
            <Image
              src="/StayHub logo - big.png"
              alt="StayHub logo"
              fill
              className="object-contain"
              priority
            />
          </div>

          <p className="mt-2 text-white/70 text-lg text-center">
            Prijavi se na svoj nalog.
          </p>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-2">Email.</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="npr. ana@mail.com"
              className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none focus:border-[#ff2d55]/70 focus:ring-2 focus:ring-[#ff2d55]/20"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-2">Lozinka.</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Unesi lozinku"
              className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none focus:border-[#ff2d55]/70 focus:ring-2 focus:ring-[#ff2d55]/20"
              required
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-xl bg-[#ff2d55] px-4 py-3 font-semibold text-white shadow-lg shadow-[#ff2d55]/20 hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Prijavljivanje..." : "Prijavi se"}
          </button>

          <div className="text-center text-sm text-white/60">
            Nemaš nalog?{" "}
            <a href="/register" className="text-white underline underline-offset-4">
              Registruj se
            </a>
            .
          </div>
        </form>
      </div>
    </main>
  );
}
