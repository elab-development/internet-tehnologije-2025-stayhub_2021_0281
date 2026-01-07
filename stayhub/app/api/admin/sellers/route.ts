export const runtime = "nodejs";

import { ok, handleError } from "@/server/http/response";
import { requireAuth } from "@/server/auth/requireAuth";
import { requireRole } from "@/server/auth/requireRole";
import { listSellersWithProperties } from "@/server/services/admin.service";

export async function GET() {
  try {
    const user = await requireAuth();
    requireRole(user.role, ["ADMIN"]);

    const sellers = await listSellersWithProperties();
    return ok({ sellers });
  } catch (e) {
    return handleError(e);
  }
}
