import { NextRequest, NextResponse } from "next/server";

type UserRole = "ADMIN" | "AGENT" | "CLIENT";

type TokenPayload = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
};

// Stranice koje traže da korisnik bude ulogovan.
const protectedPages = [
  "/home",
  "/properties",
  "/admin",
  "/agent",
  "/client",
];

// Stranice koje traže određenu rolu.
const roleProtectedPages: Record<string, UserRole[]> = {
  "/admin": ["ADMIN"],
  "/agent": ["AGENT"],
  "/client": ["CLIENT"],
};

// API rute koje dozvoljavamo iz browsera.
const allowedApiPrefixes = [
  "/api/auth",
  "/api/properties",
  "/api/reservations",
  "/api/reviews",
  "/api/users",
  "/api/property-images",
  "/api/admin",
  "/api/external",
];

function decodeToken(token: string): TokenPayload | null {
  try {
    // JWT ima format: header.payload.signature.
    const payloadPart = token.split(".")[1];

    if (!payloadPart) {
      return null;
    }

    // Pretvaramo base64url u normalan base64.
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");

    // Čitamo payload iz tokena.
    const decodedPayload = JSON.parse(atob(base64));

    return decodedPayload as TokenPayload;
  } catch {
    return null;
  }
}

function isProtectedPage(pathname: string) {
  // Proveravamo da li stranica zahteva login.
  return protectedPages.some((page) => pathname.startsWith(page));
}

function getRequiredRoles(pathname: string) {
  // Proveravamo da li stranica zahteva posebnu rolu.
  const protectedPath = Object.keys(roleProtectedPages).find((path) =>
    pathname.startsWith(path)
  );

  if (!protectedPath) {
    return null;
  }

  return roleProtectedPages[protectedPath];
}

function isAllowedApiRoute(pathname: string) {
  // Proveravamo da li je API ruta deo naše aplikacije.
  return allowedApiPrefixes.some((prefix) => pathname.startsWith(prefix));
}

function addCorsHeaders(response: NextResponse, request: NextRequest) {
  const origin = request.headers.get("origin");
  const currentOrigin = request.nextUrl.origin;

  // Ako zahtev dolazi iz iste aplikacije, dozvoljavamo ga.
  if (!origin || origin === currentOrigin) {
    response.headers.set("Access-Control-Allow-Origin", currentOrigin);
  }

  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );

  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  response.headers.set("Access-Control-Allow-Credentials", "true");

  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("token")?.value;
  const user = token ? decodeToken(token) : null;

  // Ako korisnik otvori root rutu, šaljemo ga na auth.
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // Ako je korisnik već ulogovan i ode na auth, šaljemo ga na home.
  if (pathname === "/auth" && user) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // Ako stranica zahteva login, a korisnik nema token, šaljemo ga na auth.
  if (isProtectedPage(pathname) && !user) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  const requiredRoles = getRequiredRoles(pathname);

  // Ako stranica zahteva rolu, a korisnik nema tu rolu, šaljemo ga na home.
  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // CORS zaštita za API rute.
  if (pathname.startsWith("/api")) {
    const origin = request.headers.get("origin");
    const currentOrigin = request.nextUrl.origin;

    // Blokiramo API rute koje nisu deo naše aplikacije.
    if (!isAllowedApiRoute(pathname)) {
      return NextResponse.json(
        { message: "API route is not allowed." },
        { status: 403 }
      );
    }

    // Ako zahtev dolazi sa drugog domena, blokiramo ga.
    if (origin && origin !== currentOrigin) {
      return NextResponse.json(
        { message: "CORS blocked: origin is not allowed." },
        { status: 403 }
      );
    }

    // Browser nekad prvo šalje OPTIONS zahtev pre pravog API zahteva.
    if (request.method === "OPTIONS") {
      const response = new NextResponse(null, { status: 204 });
      return addCorsHeaders(response, request);
    }

    const response = NextResponse.next();
    return addCorsHeaders(response, request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/auth",
    "/home/:path*",
    "/properties/:path*",
    "/admin/:path*",
    "/agent/:path*",
    "/client/:path*",
    "/api/:path*",
  ],
};