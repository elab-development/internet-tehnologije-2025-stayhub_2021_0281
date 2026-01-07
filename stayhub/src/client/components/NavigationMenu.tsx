"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { MeResponse } from "@/client/types/meReponse";

function initialsFromName(name?: string | null) {
  const safe = (name ?? "").trim();
  if (!safe) return "U";
  const parts = safe.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "U";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + last).toUpperCase();
}

export default function NavigationMenu() {
  const router = useRouter();

  const [me, setMe] = useState<MeResponse["user"]>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data: MeResponse = await res.json();
        if (alive) setMe(data.user);
      } catch {
        if (alive) setMe(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const role = me?.userRole;

  const roleLabel = useMemo(() => {
    if (role === "BUYER") return "BUYER";
    if (role === "SELLER") return "SELLER";
    if (role === "ADMIN") return "ADMIN";
    return "";
  }, [role]);

  const logoHref = useMemo(() => {
    if (role === "BUYER") return "/buyer/home";
    if (role === "SELLER") return "/seller/home";
    if (role === "ADMIN") return "/admin/home";
    return "/login";
  }, [role]);

  const links = useMemo(() => {
    if (role === "BUYER") {
      return [
        { label: "Home", href: "/buyer/home" },
        { label: "Properties", href: "/buyer/properties" },
        { label: "My Reservations", href: "/buyer/my-reservations" },
      ];
    }

    if (role === "SELLER") {
      return [
        { label: "Home", href: "/seller/home" },
        { label: "My Properties", href: "/seller/my-properties" },
        { label: "Manage Reservations", href: "/seller/manage-reservations" },
      ];
    }

    if (role === "ADMIN") {
      return [
        { label: "Home", href: "/admin/home" },
        { label: "Dashboard", href: "/admin/dashboard" },
      ];
    }

    return [];
  }, [role]);

  async function onLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-slate-950/60 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Left: Logo */}
        <Link href={logoHref} className="flex items-center gap-3">
          <div className="relative h-8 w-28">
            <Image
              src="/StayHub logo - big.png"
              alt="StayHub"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Middle: Links */}
        <nav className="hidden items-center gap-2 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right: User */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-9 w-28 rounded-xl bg-white/5 animate-pulse" />
          ) : me ? (
            <>
              <div className="hidden text-right sm:block">
                <div className="text-sm font-semibold leading-4">{me.name}</div>
                <div className="text-xs text-white/60">{roleLabel}</div>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5 font-semibold">
                {initialsFromName(me.name)}
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-[#ff2d55] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
