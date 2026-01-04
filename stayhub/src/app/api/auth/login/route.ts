export const runtime = "nodejs";

import { prisma } from "@/server/db/prisma";
import { verifyPassword } from "@/server/auth/password";
import { signToken } from "@/server/auth/jwt";
import { setSessionCookie } from "@/server/auth/session";
import { loginSchema } from "@/server/validators/auth";
import { ok, fail, handleError } from "@/server/http/response";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message || "Nevalidan unos.", 400);
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return fail("Pogrešni kredencijali.", 401);

    const passOk = await verifyPassword(password, user.password);
    if (!passOk) return fail("Pogrešni kredencijali.", 401);

    const token = signToken({ sub: user.id, role: user.userRole });
    await setSessionCookie(token);

    return ok({
      user: { id: user.id, name: user.name, email: user.email, userRole: user.userRole },
    });
  } catch (e) {
    return handleError(e);
  }
}
