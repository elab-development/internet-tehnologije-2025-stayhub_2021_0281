import { prisma } from "../db/prisma";
import { Prisma } from "@prisma/client";
import type { ReservationStatus } from "@prisma/client";

export type CreateReservationInput = {
  propertyId: number;
  startDate: Date;
  endDate: Date;
};

function daysBetween(start: Date, end: Date) {
  const ms = end.getTime() - start.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export async function createReservation(buyerId: number, input: CreateReservationInput) {
  if (input.startDate >= input.endDate) {
    throw Object.assign(new Error("Početni datum mora biti pre krajnjeg."), { status: 400 });
  }

  const nights = daysBetween(input.startDate, input.endDate);
  if (nights <= 0) {
    throw Object.assign(new Error("Nevalidan period."), { status: 400 });
  }

  const property = await prisma.property.findUnique({ where: { id: input.propertyId } });
  if (!property) throw Object.assign(new Error("Nekretnina ne postoji."), { status: 404 });

  const total = Number(property.price) * nights;
  if (!(total > 0)) throw Object.assign(new Error("Ukupna cena mora biti pozitivna."), { status: 400 });

  try {
    const created = await prisma.reservation.create({
      data: {
        startDate: input.startDate,
        endDate: input.endDate,
        totalPrice: new Prisma.Decimal(total.toFixed(2)),
        status: "PENDING",
        userId: buyerId,
        propertyId: input.propertyId,
      },
      include: {
        property: { include: { location: true, category: true, seller: { select: { id: true, name: true } } } },
      },
    });

    return created;
  } catch (e: any) {
    // @@unique([propertyId, startDate, endDate]) -> P2002
    if (e?.code === "P2002") {
      throw Object.assign(new Error("Rezervacija za isti period već postoji."), { status: 409 });
    }
    throw e;
  }
}

export async function listMyReservations(buyerId: number) {
  return prisma.reservation.findMany({
    where: { userId: buyerId },
    orderBy: { startDate: "desc" },
    include: {
      property: {
        include: { location: true, category: true, seller: { select: { id: true, name: true } } },
      },
    },
  });
}

export async function cancelReservation(buyerId: number, reservationId: number) {
  const res = await prisma.reservation.findUnique({ where: { id: reservationId } });
  if (!res) throw Object.assign(new Error("Rezervacija ne postoji."), { status: 404 });
  if (res.userId !== buyerId) throw Object.assign(new Error("Zabranjeno."), { status: 403 });

  if (res.status === "CONFIRMED") {
    throw Object.assign(new Error("Završena rezervacija se ne može otkazati."), { status: 400 });
  }

  if (res.status === "CANCELLED") return { ok: true };

  await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: "CANCELLED" },
  });

  return { ok: true };
}

export async function listSellerReservations(sellerId: number) {
  return prisma.reservation.findMany({
    where: { property: { sellerId } },
    orderBy: { startDate: "desc" },
    include: {
      property: { include: { location: true, category: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function updateReservationStatusAsSeller(
  sellerId: number,
  reservationId: number,
  status: ReservationStatus
) {
  const res = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { property: true },
  });

  if (!res) throw Object.assign(new Error("Rezervacija ne postoji."), { status: 404 });
  if (res.property.sellerId !== sellerId) throw Object.assign(new Error("Zabranjeno."), { status: 403 });

  return prisma.reservation.update({
    where: { id: reservationId },
    data: { status },
  });
}
