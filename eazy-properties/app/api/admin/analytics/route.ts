import { NextResponse } from "next/server";
import { getEntityManager } from "@/helpers/mikroOrm";
import { getCurrentUser, hasRole } from "@/helpers/auth";

import { User, UserRole } from "@/entities/User";
import { Property } from "@/entities/Property";
import { Reservation, ReservationStatus } from "@/entities/Reservation";
import { Review } from "@/entities/Review";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    // Samo admin može da vidi analitiku aplikacije.
    if (!hasRole(currentUser, [UserRole.ADMIN])) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    const em = await getEntityManager();

    // Učitavamo sve podatke koji su potrebni za analytics.
    const users = await em.find(User, {});
    const properties = await em.find(Property, {});
    const reservations = await em.find(
      Reservation,
      {},
      {
        populate: ["property"],
      }
    );
    const reviews = await em.find(Review, {});

    const adminCount = users.filter((user) => user.role === UserRole.ADMIN).length;
    const agentCount = users.filter((user) => user.role === UserRole.AGENT).length;
    const clientCount = users.filter((user) => user.role === UserRole.CLIENT).length;

    const pendingReservations = reservations.filter(
      (reservation) => reservation.status === ReservationStatus.PENDING
    ).length;

    const approvedReservations = reservations.filter(
      (reservation) => reservation.status === ReservationStatus.APPROVED
    ).length;

    const rejectedReservations = reservations.filter(
      (reservation) => reservation.status === ReservationStatus.REJECTED
    ).length;

    const cancelledReservations = reservations.filter(
      (reservation) => reservation.status === ReservationStatus.CANCELLED
    ).length;

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        : 0;

    const cityMap: Record<string, number> = {};

    properties.forEach((property) => {
      cityMap[property.city] = (cityMap[property.city] || 0) + 1;
    });

    const propertyCities = Object.keys(cityMap);
    const propertyCityCounts = Object.values(cityMap);

    const reservationValueByProperty = reservations.map((reservation) => {
      const start = new Date(reservation.startDate);
      const end = new Date(reservation.endDate);

      // Računamo broj noći između start i end datuma.
      const nights = Math.max(
        1,
        Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      );

      return {
        propertyTitle: reservation.property.title,
        value: nights * reservation.property.price,
      };
    });

    return NextResponse.json({
      data: {
        totals: {
          users: users.length,
          properties: properties.length,
          reservations: reservations.length,
          reviews: reviews.length,
          averageRating: Number(averageRating.toFixed(2)),
        },
        usersByRole: {
          labels: ["Admin", "Agent", "Client"],
          values: [adminCount, agentCount, clientCount],
        },
        reservationsByStatus: {
          labels: ["Pending", "Approved", "Rejected", "Cancelled"],
          values: [
            pendingReservations,
            approvedReservations,
            rejectedReservations,
            cancelledReservations,
          ],
        },
        propertiesByCity: {
          labels: propertyCities,
          values: propertyCityCounts,
        },
        reservationValueByProperty: {
          labels: reservationValueByProperty.map((item) => item.propertyTitle),
          values: reservationValueByProperty.map((item) => item.value),
        },
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);

    return NextResponse.json(
      { message: "Failed to load analytics." },
      { status: 500 }
    );
  }
}