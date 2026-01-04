import { prisma } from "../db/prisma";
import { Prisma } from "@prisma/client";

export type PropertyListQuery = {
  name?: string;
  city?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  minRooms?: number;
  maxRooms?: number;
  sortBy?: "name" | "price" | "rooms" | "city";
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

export type CreatePropertyInput = {
  name: string;
  description: string;
  image: string;
  price: number;
  rooms: number;
  address: string;
  city: string;
  categoryId: number;
};

export type UpdatePropertyInput = Partial<CreatePropertyInput>;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export async function listProperties(q: PropertyListQuery) {
  const page = clamp(q.page ?? 1, 1, 1_000_000);
  const pageSize = clamp(q.pageSize ?? 10, 1, 50);
  const skip = (page - 1) * pageSize;

  const where: Prisma.PropertyWhereInput = {
    ...(q.name
      ? { name: { contains: q.name.trim(), mode: "insensitive" } }
      : {}),
    ...(q.categoryId ? { categoryId: q.categoryId } : {}),
    ...(q.minRooms ? { rooms: { gte: q.minRooms } } : {}),
    ...(q.maxRooms ? { rooms: { lte: q.maxRooms } } : {}),
    ...(q.minPrice || q.maxPrice
      ? {
          price: {
            ...(q.minPrice ? { gte: new Prisma.Decimal(q.minPrice) } : {}),
            ...(q.maxPrice ? { lte: new Prisma.Decimal(q.maxPrice) } : {}),
          },
        }
      : {}),
    ...(q.city
      ? { location: { city: { contains: q.city.trim(), mode: "insensitive" } } }
      : {}),
  };

  const order: "asc" | "desc" = q.order === "desc" ? "desc" : "asc";
  const sortBy = q.sortBy ?? "name";

  const orderBy: any =
    sortBy === "price"
      ? { price: order }
      : sortBy === "rooms"
      ? { rooms: order }
      : sortBy === "city"
      ? { location: { city: order } }
      : { name: order };

  const [total, items] = await Promise.all([
    prisma.property.count({ where }),
    prisma.property.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      include: {
        location: true,
        category: true,
        seller: { select: { id: true, name: true } },
      },
    }),
  ]);

  return { page, pageSize, total, items };
}

export async function getPropertyById(id: number) {
  return prisma.property.findUnique({
    where: { id },
    include: {
      location: true,
      category: true,
      seller: { select: { id: true, name: true } },
      reservations: true,
    },
  });
}

export async function createProperty(sellerId: number, input: CreatePropertyInput) {
  // Validacija postojanja kategorije (zahtev).
  const cat = await prisma.category.findUnique({ where: { id: input.categoryId } });
  if (!cat) throw Object.assign(new Error("Odabrana kategorija ne postoji."), { status: 400 });

  const created = await prisma.$transaction(async (tx) => {
    const loc = await tx.location.create({
      data: { address: input.address, city: input.city },
    });

    return tx.property.create({
      data: {
        name: input.name,
        description: input.description,
        image: input.image,
        price: new Prisma.Decimal(input.price.toFixed(2)),
        rooms: input.rooms,
        sellerId,
        locationId: loc.id,
        categoryId: input.categoryId,
      },
      include: {
        location: true,
        category: true,
        seller: { select: { id: true, name: true } },
      },
    });
  });

  return created;
}

export async function updateProperty(sellerId: number, propertyId: number, input: UpdatePropertyInput) {
  const existing = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!existing) throw Object.assign(new Error("Nekretnina ne postoji."), { status: 404 });
  if (existing.sellerId !== sellerId) throw Object.assign(new Error("Zabranjeno."), { status: 403 });

  if (input.categoryId !== undefined) {
    const cat = await prisma.category.findUnique({ where: { id: input.categoryId } });
    if (!cat) throw Object.assign(new Error("Odabrana kategorija ne postoji."), { status: 400 });
  }

  // Ako se menja adresa/grad, update Location tabele.
  if (input.address !== undefined || input.city !== undefined) {
    await prisma.location.update({
      where: { id: existing.locationId },
      data: {
        ...(input.address !== undefined ? { address: input.address } : {}),
        ...(input.city !== undefined ? { city: input.city } : {}),
      },
    });
  }

  const data: Prisma.PropertyUpdateInput = {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.image !== undefined ? { image: input.image } : {}),
    ...(input.price !== undefined ? { price: new Prisma.Decimal(input.price.toFixed(2)) } : {}),
    ...(input.rooms !== undefined ? { rooms: input.rooms } : {}),
    ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
  };

  return prisma.property.update({
    where: { id: propertyId },
    data,
    include: {
      location: true,
      category: true,
      seller: { select: { id: true, name: true } },
    },
  });
}

export async function deleteProperty(sellerId: number, propertyId: number) {
  const existing = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!existing) throw Object.assign(new Error("Nekretnina ne postoji."), { status: 404 });
  if (existing.sellerId !== sellerId) throw Object.assign(new Error("Zabranjeno."), { status: 403 });

  await prisma.$transaction(async (tx) => {
    await tx.reservation.deleteMany({ where: { propertyId } });
    await tx.property.delete({ where: { id: propertyId } });
    await tx.location.delete({ where: { id: existing.locationId } });
  });

  return { ok: true };
}
