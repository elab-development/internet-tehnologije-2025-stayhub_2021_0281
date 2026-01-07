export const runtime = "nodejs";

import { ok, fail, handleError } from "@/server/http/response";
import { requireAuth } from "@/server/auth/requireAuth";
import { prisma } from "@/server/db/prisma";

function parseId(params: { id: string }) {
  const id = Number(params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();

    const id = parseId(params);
    if (!id) return fail("Nevalidan id.", 400);

    const res = await prisma.reservation.findUnique({
      where: { id },
      include: {
        property: { include: { location: true, category: true, seller: { select: { id: true, name: true } } } },
      },
    });

    if (!res) return fail("Rezervacija ne postoji.", 404);

    // BUYER vidi samo svoje.
    if (user.role === "BUYER" && res.userId !== user.sub) {
      return fail("Zabranjeno.", 403);
    }

    // SELLER vidi samo rezervacije za svoje nekretnine.
    if (user.role === "SELLER") {
      const prop = await prisma.property.findUnique({ where: { id: res.propertyId } });
      if (!prop || prop.sellerId !== user.sub) return fail("Zabranjeno.", 403);
    }

    // ADMIN može sve.
    return ok(res);
  } catch (e) {
    return handleError(e);
  }
}