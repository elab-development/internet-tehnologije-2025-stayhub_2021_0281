import { NextRequest, NextResponse } from "next/server";
import { getEntityManager } from "@/helpers/mikroOrm";
import { getCurrentUser } from "@/helpers/auth";

import { UserRole } from "@/entities/User";
import { Reservation, ReservationStatus } from "@/entities/Reservation";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function formatReservation(reservation: Reservation) {
  return {
    id: reservation.id,
    startDate: reservation.startDate,
    endDate: reservation.endDate,
    status: reservation.status,
    createdAt: reservation.createdAt,
    client: {
      id: reservation.client.id,
      name: reservation.client.name,
      email: reservation.client.email,
      role: reservation.client.role,
    },
    property: {
      id: reservation.property.id,
      title: reservation.property.title,
      city: reservation.property.city,
      address: reservation.property.address,
      price: reservation.property.price,
      imageUrl: reservation.property.imageUrl,
      agent: {
        id: reservation.property.agent.id,
        name: reservation.property.agent.name,
        email: reservation.property.agent.email,
        role: reservation.property.agent.role,
      },
    },
  };
}

function isValidReservationStatus(status: string) {
  return Object.values(ReservationStatus).includes(status as ReservationStatus);
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const reservationId = Number(id);

    if (Number.isNaN(reservationId)) {
      return NextResponse.json({ message: "Invalid ID." }, { status: 400 });
    }

    const em = await getEntityManager();

    const reservation = await em.findOne(
      Reservation,
      {
        id: reservationId,
      },
      {
        populate: ["client", "property", "property.agent"],
      }
    );

    if (!reservation) {
      return NextResponse.json(
        { message: "Reservation not found." },
        { status: 404 }
      );
    }

    // Klijent vidi samo svoju rezervaciju.
    if (
      currentUser.role === UserRole.CLIENT &&
      reservation.client.id !== currentUser.id
    ) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    // Agent vidi samo rezervacije za svoje nekretnine.
    if (
      currentUser.role === UserRole.AGENT &&
      reservation.property.agent.id !== currentUser.id
    ) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    return NextResponse.json({
      data: formatReservation(reservation),
    });
  } catch (error) {
    console.error("Get reservation error:", error);

    return NextResponse.json(
      { message: "Failed to get reservation." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const reservationId = Number(id);

    if (Number.isNaN(reservationId)) {
      return NextResponse.json({ message: "Invalid ID." }, { status: 400 });
    }

    const em = await getEntityManager();

    const reservation = await em.findOne(
      Reservation,
      {
        id: reservationId,
      },
      {
        populate: ["client", "property", "property.agent"],
      }
    );

    if (!reservation) {
      return NextResponse.json(
        { message: "Reservation not found." },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Klijent može menjati datume samo svoje rezervacije.
    if (currentUser.role === UserRole.CLIENT) {
      if (reservation.client.id !== currentUser.id) {
        return NextResponse.json({ message: "Forbidden." }, { status: 403 });
      }

      reservation.startDate = body.startDate
        ? new Date(body.startDate)
        : reservation.startDate;

      reservation.endDate = body.endDate
        ? new Date(body.endDate)
        : reservation.endDate;

      await em.flush();

      return NextResponse.json({
        message: "Reservation updated successfully.",
        data: formatReservation(reservation),
      });
    }

    // Agent može menjati status rezervacije samo za svoju nekretninu.
    if (currentUser.role === UserRole.AGENT) {
      if (reservation.property.agent.id !== currentUser.id) {
        return NextResponse.json({ message: "Forbidden." }, { status: 403 });
      }

      if (body.status) {
        if (!isValidReservationStatus(body.status)) {
          return NextResponse.json(
            { message: "Invalid reservation status." },
            { status: 400 }
          );
        }

        reservation.status = body.status;
      }

      await em.flush();

      return NextResponse.json({
        message: "Reservation status updated successfully.",
        data: formatReservation(reservation),
      });
    }

    // Admin može menjati sve.
    if (body.startDate) {
      reservation.startDate = new Date(body.startDate);
    }

    if (body.endDate) {
      reservation.endDate = new Date(body.endDate);
    }

    if (body.status) {
      if (!isValidReservationStatus(body.status)) {
        return NextResponse.json(
          { message: "Invalid reservation status." },
          { status: 400 }
        );
      }

      reservation.status = body.status;
    }

    await em.flush();

    return NextResponse.json({
      message: "Reservation updated successfully.",
      data: formatReservation(reservation),
    });
  } catch (error) {
    console.error("Update reservation error:", error);

    return NextResponse.json(
      { message: "Failed to update reservation." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const reservationId = Number(id);

    if (Number.isNaN(reservationId)) {
      return NextResponse.json({ message: "Invalid ID." }, { status: 400 });
    }

    const em = await getEntityManager();

    const reservation = await em.findOne(
      Reservation,
      {
        id: reservationId,
      },
      {
        populate: ["client", "property", "property.agent"],
      }
    );

    if (!reservation) {
      return NextResponse.json(
        { message: "Reservation not found." },
        { status: 404 }
      );
    }

    // Klijent može brisati samo svoje rezervacije.
    if (
      currentUser.role === UserRole.CLIENT &&
      reservation.client.id !== currentUser.id
    ) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    // Agent može brisati samo rezervacije za svoje nekretnine.
    if (
      currentUser.role === UserRole.AGENT &&
      reservation.property.agent.id !== currentUser.id
    ) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    // Admin može brisati sve rezervacije.
    em.remove(reservation);
    await em.flush();

    return NextResponse.json({
      message: "Reservation deleted successfully.",
    });
  } catch (error) {
    console.error("Delete reservation error:", error);

    return NextResponse.json(
      { message: "Failed to delete reservation." },
      { status: 500 }
    );
  }
}