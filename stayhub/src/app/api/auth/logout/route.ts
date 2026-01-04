export const runtime = "nodejs";

import { clearSessionCookie } from "@/server/auth/session";
import { ok, handleError } from "@/server/http/response";

export async function POST() {
  try {
    await clearSessionCookie();
    return ok({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
