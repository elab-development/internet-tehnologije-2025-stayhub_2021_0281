"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "Neuspešna registracija.");
        return;
      }

      // Backend postavlja httpOnly cookie, pa je korisnik već ulogovan.
      router.push("/login");
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
            Kreiraj svoj nalog.
          </p>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-2">Ime i prezime.</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="npr. Ana Anić"
              className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none focus:border-[#ff2d55]/70 focus:ring-2 focus:ring-[#ff2d55]/20"
              required
              minLength={2}
            />
          </div>

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
              minLength={6}
            />
            <p className="mt-2 text-xs text-white/50">
              Lozinka mora imati najmanje 6 karaktera.
            </p>
          </div>

          <button
            disabled={loading}
            className="w-full rounded-xl bg-[#ff2d55] px-4 py-3 font-semibold text-white shadow-lg shadow-[#ff2d55]/20 hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Kreiranje naloga..." : "Registruj se"}
          </button>

          <div className="text-center text-sm text-white/60">
            Već imaš nalog?{" "}
            <a href="/login" className="text-white underline underline-offset-4">
              Prijavi se
            </a>
            .
          </div>
        </form>
      </div>
    </main>
  );
}
