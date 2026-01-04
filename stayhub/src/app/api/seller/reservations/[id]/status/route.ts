export const runtime = "nodejs";

import { ok, fail, handleError } from "@/server/http/response";
import { requireAuth } from "@/server/auth/requireAuth";
import { requireRole } from "@/server/auth/requireRole";
import { updateReservationStatusSchema } from "@/server/validators/reservation";
import { updateReservationStatusAsSeller } from "@/server/services/reservations.service";

function parseId(params: { id: string }) {
  const id = Number(params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    requireRole(user.role, ["SELLER"]);

    const id = parseId(params);
    if (!id) return fail("Nevalidan id.", 400);

    const body = await req.json();
    const parsed = updateReservationStatusSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message || "Nevalidan unos.", 400);
    }

    // U tvom slučaju nema COMPLETED, samo PENDING/CONFIRMED/CANCELLED.
    const updated = await updateReservationStatusAsSeller(user.sub, id, parsed.data.status);
    return ok(updated);
  } catch (e) {
    return handleError(e);
  }
}
