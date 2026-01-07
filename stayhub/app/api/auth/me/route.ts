export const runtime = "nodejs";

import { prisma } from "@/server/db/prisma";
import { getSessionCookie } from "@/server/auth/session";
import { verifyToken } from "@/server/auth/jwt";
import { ok } from "@/server/http/response";

export async function GET() {
  const token = await getSessionCookie();
  if (!token) return ok({ user: null });

  try {
    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, userRole: true },
    });

    return ok({ user });
  } catch {
    return ok({ user: null });
  }
}
