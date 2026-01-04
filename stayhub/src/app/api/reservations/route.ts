export const runtime = "nodejs";

import { ok, fail, handleError } from "@/server/http/response";
import { requireAuth } from "@/server/auth/requireAuth";
import { requireRole } from "@/server/auth/requireRole";
import { createReservationSchema } from "@/server/validators/reservation";
import { createReservation } from "@/server/services/reservations.service";

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    requireRole(user.role, ["BUYER"]);

    const body = await req.json();
    const parsed = createReservationSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message || "Nevalidan unos.", 400);
    }

    const created = await createReservation(user.sub, {
      propertyId: parsed.data.propertyId,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
    });

    return ok(created, 201);
  } catch (e) {
    return handleError(e);
  }
}
