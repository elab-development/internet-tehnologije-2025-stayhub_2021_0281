import { getSessionCookie } from "./session";
import { verifyToken } from "./jwt";

/**
 * Vraća payload iz JWT-a (userId + role).
 * Baca grešku sa status=401 ako korisnik nije autentifikovan.
 */
export async function requireAuth() {
  const token = await getSessionCookie();

  if (!token) {
    throw Object.assign(new Error("UNAUTHORIZED"), { status: 401 });
  }

  return verifyToken(token);
}
