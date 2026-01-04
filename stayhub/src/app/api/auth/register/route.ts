export const runtime = "nodejs";

import { prisma } from "@/server/db/prisma";
import { hashPassword } from "@/server/auth/password";
import { signToken } from "@/server/auth/jwt";
import { setSessionCookie } from "@/server/auth/session";
import { registerSchema } from "@/server/validators/auth";
import { ok, fail, handleError } from "@/server/http/response";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message || "Nevalidan unos.", 400);
    }

    const { name, email, password } = parsed.data;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return fail("Email već postoji.", 409);

    // Registracija uvek kreira BUYER (zahtev).
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: await hashPassword(password),
        userRole: "BUYER",
      },
      select: { id: true, name: true, email: true, userRole: true },
    });

    const token = signToken({ sub: user.id, role: user.userRole });
    await setSessionCookie(token);

    return ok({ user }, 201);
  } catch (e) {
    return handleError(e);
  }
}
