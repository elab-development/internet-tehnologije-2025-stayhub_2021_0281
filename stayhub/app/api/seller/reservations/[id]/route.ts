export const runtime = "nodejs";

import { ok, fail, handleError } from "@/server/http/response";
import { requireAuth } from "@/server/auth/requireAuth";
import { requireRole } from "@/server/auth/requireRole";
import { deleteReservationAsSeller } from "@/server/services/reservations.service";

function parseId(idStr: string) {
  const id = Number(idStr);
  return Number.isInteger(id) && id > 0 ? id : null;
}

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const user = await requireAuth();
    requireRole(user.role, ["SELLER"]);

    const { id: idStr } = await ctx.params; // <<< BITNO
    const id = parseId(idStr);
    if (!id) return fail("Nevalidan id.", 400);

    await deleteReservationAsSeller(user.sub, id);
    return ok({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
