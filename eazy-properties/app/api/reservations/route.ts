import { NextRequest, NextResponse } from "next/server";
import { getEntityManager } from "@/helpers/mikroOrm";
import { getCurrentUser, hasRole } from "@/helpers/auth";

import { User, UserRole } from "@/entities/User";
import { Property } from "@/entities/Property";
import { Reservation, ReservationStatus } from "@/entities/Reservation";

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
    },
  };
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    // Samo ulogovani korisnici mogu da vide rezervacije.
    if (!currentUser) {
      return NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 }
      );
    }

    const em = await getEntityManager();

    let reservations: Reservation[] = [];

    if (currentUser.role === UserRole.ADMIN) {
      // Admin vidi sve rezervacije.
      reservations = await em.find(
        Reservation,
        {},
        {
          populate: ["client", "property"],
          orderBy: {
            id: "asc",
          },
        }
      );
    } else if (currentUser.role === UserRole.AGENT) {
      // Agent vidi rezervacije za svoje nekretnine.
      reservations = await em.find(
        Reservation,
        {
          property: {
            agent: {
              id: currentUser.id,
            },
          },
        },
        {
          populate: ["client", "property"],
          orderBy: {
            id: "asc",
          },
        }
      );
    } else {
      // Klijent vidi samo svoje rezervacije.
      reservations = await em.find(
        Reservation,
        {
          client: {
            id: currentUser.id,
          },
        },
        {
          populate: ["client", "property"],
          orderBy: {
            id: "asc",
          },
        }
      );
    }

    return NextResponse.json({
      data: reservations.map(formatReservation),
    });
  } catch (error) {
    console.error("Get reservations error:", error);

    return NextResponse.json(
      { message: "Failed to get reservations." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    // Samo klijent može da napravi rezervaciju.
    if (!hasRole(currentUser, [UserRole.CLIENT])) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    const body = await request.json();

    if (!body.startDate || !body.endDate || !body.propertyId) {
      return NextResponse.json(
        { message: "Start date, end date and property ID are required." },
        { status: 400 }
      );
    }

    const em = await getEntityManager();

    // Ulogovani klijent je vlasnik rezervacije.
    const client = await em.findOne(User, {
      id: currentUser!.id,
    });

    if (!client) {
      return NextResponse.json(
        { message: "Client user was not found." },
        { status: 404 }
      );
    }

    const property = await em.findOne(Property, {
      id: Number(body.propertyId),
    });

    if (!property) {
      return NextResponse.json(
        { message: "Property not found." },
        { status: 404 }
      );
    }

    const reservation = em.create(Reservation, {
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      status: ReservationStatus.PENDING,
      createdAt: new Date(),
      client,
      property,
    });

    // Čuvamo novu rezervaciju u bazu.
    em.persist(reservation);
    await em.flush();

    return NextResponse.json({
      message: "Reservation created successfully.",
      data: formatReservation(reservation),
    });
  } catch (error) {
    console.error("Create reservation error:", error);

    return NextResponse.json(
      { message: "Failed to create reservation." },
      { status: 500 }
    );
  }
}