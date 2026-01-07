export const runtime = "nodejs";

import { prisma } from "@/server/db/prisma";
import { ok, handleError } from "@/server/http/response";

export async function GET() {
  try {
    const items = await prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, description: true },
    });

    return ok({ total: items.length, items });
  } catch (e) {
    return handleError(e);
  }
}
