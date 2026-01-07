export const runtime = "nodejs";

import { ok, fail, handleError } from "@/server/http/response";
import { requireAuth } from "@/server/auth/requireAuth";
import { requireRole } from "@/server/auth/requireRole";
import { createPropertySchema } from "@/server/validators/property";
import { listProperties, createProperty } from "@/server/services/properties.service";

function toNum(v: string | null) {
  if (v === null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const mine = url.searchParams.get("mine") === "1";

    // Ako je mine=1, onda samo SELLER sme i vraćamo samo njegove nekretnine.
    let sellerId: number | undefined = undefined;

    if (mine) {
      const user = await requireAuth();
      requireRole(user.role, ["SELLER"]);
      sellerId = user.sub;
    }

    const data = await listProperties({
      sellerId,
      name: url.searchParams.get("name") || undefined,
      city: url.searchParams.get("city") || undefined,
      categoryId: toNum(url.searchParams.get("categoryId")),
      minPrice: toNum(url.searchParams.get("minPrice")),
      maxPrice: toNum(url.searchParams.get("maxPrice")),
      minRooms: toNum(url.searchParams.get("minRooms")),
      maxRooms: toNum(url.searchParams.get("maxRooms")),
      sortBy: (url.searchParams.get("sortBy") as any) || undefined,
      order: (url.searchParams.get("order") as any) || undefined,
      page: toNum(url.searchParams.get("page")),
      pageSize: toNum(url.searchParams.get("pageSize")),
    });

    return ok(data);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    requireRole(user.role, ["SELLER"]);

    const body = await req.json();
    const parsed = createPropertySchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message || "Nevalidan unos.", 400);
    }

    const created = await createProperty(user.sub, parsed.data);
    return ok(created, 201);
  } catch (e) {
    return handleError(e);
  }
}
