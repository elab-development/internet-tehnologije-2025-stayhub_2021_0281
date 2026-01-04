import { prisma } from "../db/prisma";

export async function listSellersWithProperties() {
  return prisma.user.findMany({
    where: { userRole: "SELLER" },
    select: {
      id: true,
      name: true,
      email: true,
      properties: {
        include: { location: true, category: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getAdminMetrics() {
  const totalReservations = await prisma.reservation.count();

  // count rezervacija po propertyId
  const grouped = await prisma.reservation.groupBy({
    by: ["propertyId"],
    _count: { _all: true },
  });

  // Mapiranje propertyId -> sellerId
  const props = await prisma.property.findMany({ select: { id: true, sellerId: true } });
  const propToSeller = new Map<number, number>();
  for (const p of props) propToSeller.set(p.id, p.sellerId);

  // Agregacija po prodavcu
  const sellerCounts = new Map<number, number>();
  for (const row of grouped) {
    const sellerId = propToSeller.get(row.propertyId);
    if (!sellerId) continue;
    sellerCounts.set(sellerId, (sellerCounts.get(sellerId) || 0) + row._count._all);
  }

  const sellers = await prisma.user.findMany({
    where: { userRole: "SELLER" },
    select: { id: true, name: true, email: true },
  });

  const reservationsPerSeller = sellers.map((s) => ({
    sellerId: s.id,
    sellerName: s.name,
    count: sellerCounts.get(s.id) || 0,
  }));

  // Prihodi po mesecima (PostgreSQL).
  // Napomena: Prisma Decimal se u raw query često vrati kao string -> ostavljamo kao string radi bezbednosti.
  const revenueByMonth = await prisma.$queryRaw<{ month: string; revenue: string }[]>`
    SELECT to_char(date_trunc('month', "startDate"), 'YYYY-MM') as month,
           COALESCE(SUM("totalPrice"), 0)::text as revenue
    FROM "Reservation"
    GROUP BY 1
    ORDER BY 1 ASC;
  `;

  return {
    totalReservations,
    reservationsPerSeller,
    revenueByMonth,
  };
}

export async function getReservationsReport(from: Date, to: Date) {
  if (from > to) {
    throw Object.assign(new Error("from mora biti pre to."), { status: 400 });
  }

  const items = await prisma.reservation.findMany({
    where: {
      startDate: { gte: from },
      endDate: { lte: to },
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      property: {
        include: {
          location: true,
          category: true,
          seller: { select: { id: true, name: true, email: true } },
        },
      },
    },
    orderBy: { startDate: "asc" },
  });

  return { from, to, count: items.length, items };
}
