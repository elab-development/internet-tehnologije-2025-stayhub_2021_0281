export const runtime = "nodejs";

import { ok, fail, handleError } from "@/server/http/response";
import { requireAuth } from "@/server/auth/requireAuth";
import { requireRole } from "@/server/auth/requireRole";
import { updatePropertySchema } from "@/server/validators/property";
import { getPropertyById, updateProperty, deleteProperty } from "@/server/services/properties.service";

function parseId(raw: string) {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function GET(
  _: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idRaw } = await ctx.params; // ✅ await params
    const id = parseId(idRaw);
    if (!id) return fail("Nevalidan id.", 400);

    const item = await getPropertyById(id);
    if (!item) return fail("Nekretnina ne postoji.", 404);

    return ok(item);
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    requireRole(user.role, ["SELLER"]);

    const { id: idRaw } = await ctx.params; // ✅ await params
    const id = parseId(idRaw);
    if (!id) return fail("Nevalidan id.", 400);

    const body = await req.json();
    const parsed = updatePropertySchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message || "Nevalidan unos.", 400);
    }

    const updated = await updateProperty(user.sub, id, parsed.data);
    return ok(updated);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(
  _: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    requireRole(user.role, ["SELLER"]);

    const { id: idRaw } = await ctx.params; // ✅ await params
    const id = parseId(idRaw);
    if (!id) return fail("Nevalidan id.", 400);

    const result = await deleteProperty(user.sub, id);
    return ok(result);
  } catch (e) {
    return handleError(e);
  }
}
