export const runtime = "nodejs";

import { ok, handleError } from "@/server/http/response";
import { requireAuth } from "@/server/auth/requireAuth";
import { requireRole } from "@/server/auth/requireRole";
import { listSellerReservations } from "@/server/services/reservations.service";

export async function GET() {
  try {
    const user = await requireAuth();
    requireRole(user.role, ["SELLER"]);

    const items = await listSellerReservations(user.sub);
    return ok({ items });
  } catch (e) {
    return handleError(e);
  }
}
