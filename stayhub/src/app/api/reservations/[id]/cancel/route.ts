export const runtime = "nodejs";

import { ok, fail, handleError } from "@/server/http/response";
import { requireAuth } from "@/server/auth/requireAuth";
import { requireRole } from "@/server/auth/requireRole";
import { cancelReservation } from "@/server/services/reservations.service";

function parseId(params: { id: string }) {
  const id = Number(params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    requireRole(user.role, ["BUYER"]);

    const id = parseId(params);
    if (!id) return fail("Nevalidan id.", 400);

    const result = await cancelReservation(user.sub, id);
    return ok(result);
  } catch (e) {
    return handleError(e);
  }
}
