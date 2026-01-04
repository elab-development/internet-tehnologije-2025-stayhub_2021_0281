export const runtime = "nodejs";

import { ok, handleError } from "@/server/http/response";
import { requireAuth } from "@/server/auth/requireAuth";
import { requireRole } from "@/server/auth/requireRole";
import { getAdminMetrics } from "@/server/services/admin.service";

export async function GET() {
  try {
    const user = await requireAuth();
    requireRole(user.role, ["ADMIN"]);

    const metrics = await getAdminMetrics();
    return ok(metrics);
  } catch (e) {
    return handleError(e);
  }
}
