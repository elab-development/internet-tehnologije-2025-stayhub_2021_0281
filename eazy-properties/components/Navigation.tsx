"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type User = {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "AGENT" | "CLIENT";
};

type NavItem = {
  label: string;
  href: string;
  icon: string;
  roles?: Array<"ADMIN" | "AGENT" | "CLIENT">;
};

const navItems: NavItem[] = [
  {
    label: "Home",
    href: "/home",
    icon: "⌂",
  },
  {
    label: "Properties",
    href: "/properties",
    icon: "◇",
    roles: ["CLIENT"],
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: "◎",
    roles: ["ADMIN"],
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: "◈",
    roles: ["ADMIN"],
  },
  {
    label: "Properties",
    href: "/agent/properties",
    icon: "▣",
    roles: ["AGENT"],
  },
  {
    label: "Reservations",
    href: "/client/reservations",
    icon: "◷",
    roles: ["CLIENT"],
  },
  {
    label: "Reviews",
    href: "/client/reviews",
    icon: "★",
    roles: ["CLIENT"],
  },
];

export default function Navigation() {
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    try {
      const response = await fetch("/api/auth/me", {
        cache: "no-store",
      });

      if (response.ok) {
        const result = await response.json();
        setUser(result.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    window.location.href = "/auth";
  }

  useEffect(() => {
    loadUser();
  }, []);

  const visibleItems = useMemo(() => {
    // Link bez roles može svako da vidi.
    // Link sa roles vidi samo korisnik sa odgovarajućom rolom.
    return navItems.filter((item) => {
      if (!item.roles) {
        return true;
      }

      if (!user) {
        return false;
      }

      return item.roles.includes(user.role);
    });
  }, [user]);

  function isActive(href: string) {
    if (href === "/home") {
      return pathname === "/home";
    }

    return pathname.startsWith(href);
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
      <div className="sidebar-glass">
        <div className="sidebar-header">
          <Link href="/home" className="sidebar-logo">
            <Image
              src={collapsed ? "/logoSizeS.png" : "/logoSizeL.png"}
              alt="EazyProperties logo"
              width={collapsed ? 48 : 205}
              height={56}
              priority
            />
          </Link>

          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setCollapsed((value) => !value)}
            aria-label="Toggle menu"
          >
            <span>{collapsed ? "→" : "←"}</span>
          </button>
        </div>

        {!collapsed && (
          <div className="sidebar-search-card">
            <span>Current role</span>
            <strong>{user ? user.role : "Guest"}</strong>
          </div>
        )}

        <nav className="sidebar-links">
          {visibleItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive(item.href) ? "active" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <span className="sidebar-icon">{item.icon}</span>

              {!collapsed && (
                <span className="sidebar-label">{item.label}</span>
              )}

              {!collapsed && isActive(item.href) && (
                <span className="active-dot" />
              )}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          {loading && (
            <div className="user-card skeleton-card">
              <div className="avatar-skeleton" />

              {!collapsed && (
                <div>
                  <span className="line-skeleton" />
                  <span className="line-skeleton small" />
                </div>
              )}
            </div>
          )}

          {!loading && user && (
            <div className="user-card">
              <div className="user-avatar">{getInitials(user.name)}</div>

              {!collapsed && (
                <div className="user-info">
                  <strong>{user.name}</strong>
                  <span>{user.role}</span>
                </div>
              )}
            </div>
          )}

          {!loading && !user && !collapsed && (
            <div className="user-card">
              <div className="user-avatar">?</div>

              <div className="user-info">
                <strong>Not logged in</strong>
                <span>GUEST</span>
              </div>
            </div>
          )}

          {!loading && (
            <button
              type="button"
              className={`logout-button ${collapsed ? "icon-only" : ""}`}
              onClick={logout}
              title={collapsed ? "Logout" : undefined}
            >
              <span>×</span>
              {!collapsed && "Logout"}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}