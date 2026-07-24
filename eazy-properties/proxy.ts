import { NextRequest, NextResponse } from "next/server";

type UserRole = "ADMIN" | "AGENT" | "CLIENT";

type TokenPayload = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  exp?: number;
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
    const decodedPayload = JSON.parse(atob(base64)) as TokenPayload;

    // Ako token ima expiration i istekao je, tretiramo ga kao nevalidan.
    if (
      decodedPayload.exp &&
      decodedPayload.exp < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return decodedPayload;
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

function clearToken(response: NextResponse) {
  // Brišemo token cookie kada je nevalidan ili istekao.
  response.cookies.set("token", "", {
    maxAge: 0,
    path: "/",
  });

  return response;
}

function redirectToAuth(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/auth", request.url));
  return clearToken(response);
}

function isAllowedOrigin(origin: string | null, request: NextRequest) {
  if (!origin) {
    return true;
  }

  const currentOrigin = request.nextUrl.origin;

  const allowedOrigins = new Set([
    currentOrigin,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://0.0.0.0:3000",
    process.env.NEXT_PUBLIC_APP_URL || "",
  ]);

  return allowedOrigins.has(origin);
}

function addCorsHeaders(response: NextResponse, request: NextRequest) {
  const origin = request.headers.get("origin");
  const currentOrigin = request.nextUrl.origin;

  // Ako je origin dozvoljen, vraćamo taj origin.
  if (origin && isAllowedOrigin(origin, request)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  } else {
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

  // Auth stranica uvek treba da može da se otvori.
  // Ne šaljemo korisnika automatski na /home, jer to pravi problem pri testiranju.
  if (pathname === "/auth") {
    const response = NextResponse.next();

    // Ako postoji token, ali nije validan, brišemo ga.
    if (token && !user) {
      return clearToken(response);
    }

    return response;
  }

  // Ako stranica zahteva login, a korisnik nema validan token, šaljemo ga na auth.
  if (isProtectedPage(pathname) && !user) {
    return redirectToAuth(request);
  }

  const requiredRoles = getRequiredRoles(pathname);

  // Ako stranica zahteva rolu, a korisnik nema tu rolu, šaljemo ga na home.
  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // CORS zaštita za API rute.
  if (pathname.startsWith("/api")) {
    const origin = request.headers.get("origin");

    // Blokiramo API rute koje nisu deo naše aplikacije.
    if (!isAllowedApiRoute(pathname)) {
      return NextResponse.json(
        { message: "API route is not allowed." },
        { status: 403 }
      );
    }

    // Ako zahtev dolazi sa nedozvoljenog origin-a, blokiramo ga.
    if (!isAllowedOrigin(origin, request)) {
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