export const runtime = "nodejs";

import { ok, fail, handleError } from "@/server/http/response";
import { requireAuth } from "@/server/auth/requireAuth";
import { requireRole } from "@/server/auth/requireRole";
import { getReservationsReport } from "@/server/services/admin.service";

export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    requireRole(user.role, ["ADMIN"]);

    const url = new URL(req.url);
    const fromStr = url.searchParams.get("from");
    const toStr = url.searchParams.get("to");

    if (!fromStr || !toStr) {
      return fail('Obavezni parametri su "from" i "to".', 400);
    }

    const from = new Date(fromStr);
    const to = new Date(toStr);

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return fail("Nevalidni datumi.", 400);
    }

    const report = await getReservationsReport(from, to);
    return ok(report);
  } catch (e) {
    return handleError(e);
  }
}
