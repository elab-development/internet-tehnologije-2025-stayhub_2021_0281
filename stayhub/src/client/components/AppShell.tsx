"use client";

import { usePathname } from "next/navigation";
import NavigationMenu from "@/client/components/NavigationMenu";
import Footer from "./Footer";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hide =
    pathname === "/login" ||
    pathname === "/register";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {!hide && <NavigationMenu />}
      <div className={!hide ? "pt-20" : ""}>{children}</div>
      {!hide && <Footer />}
    </div>
  );
}
