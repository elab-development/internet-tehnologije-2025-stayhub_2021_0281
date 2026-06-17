import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getEntityManager } from "@/helpers/mikroOrm";
import { getCurrentUser, hasRole } from "@/helpers/auth";

import { User, UserRole } from "@/entities/User";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function formatUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

function formatUserDetails(user: User) {
  return {
    ...formatUser(user),

    properties: user.properties.getItems().map((property) => ({
      id: property.id,
      title: property.title,
      city: property.city,
      address: property.address,
      price: property.price,
      imageUrl: property.imageUrl,
    })),

    reservations: user.reservations.getItems().map((reservation) => ({
      id: reservation.id,
      startDate: reservation.startDate,
      endDate: reservation.endDate,
      status: reservation.status,
      property: {
        id: reservation.property.id,
        title: reservation.property.title,
        city: reservation.property.city,
      },
    })),

    reviews: user.reviews.getItems().map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      property: {
        id: review.property.id,
        title: review.property.title,
        city: review.property.city,
      },
    })),
  };
}

function isValidUserRole(role: string) {
  return Object.values(UserRole).includes(role as UserRole);
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const currentUser = await getCurrentUser();

    // Samo admin može da vidi detalje korisnika.
    if (!hasRole(currentUser, [UserRole.ADMIN])) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    const { id } = await context.params;
    const userId = Number(id);

    if (Number.isNaN(userId)) {
      return NextResponse.json({ message: "Invalid ID." }, { status: 400 });
    }

    const em = await getEntityManager();

    const user = await em.findOne(
      User,
      {
        id: userId,
      },
      {
        populate: [
          "properties",
          "reservations",
          "reservations.property",
          "reviews",
          "reviews.property",
        ],
      }
    );

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    return NextResponse.json({
      data: formatUserDetails(user),
    });
  } catch (error) {
    console.error("Get user error:", error);

    return NextResponse.json(
      { message: "Failed to get user." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const currentUser = await getCurrentUser();

    // Samo admin može da menja korisnike.
    if (!hasRole(currentUser, [UserRole.ADMIN])) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    const { id } = await context.params;
    const userId = Number(id);

    if (Number.isNaN(userId)) {
      return NextResponse.json({ message: "Invalid ID." }, { status: 400 });
    }

    const em = await getEntityManager();

    const user = await em.findOne(User, {
      id: userId,
    });

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const body = await request.json();

    if (body.name) {
      user.name = body.name;
    }

    if (body.email) {
      user.email = body.email;
    }

    if (body.role) {
      if (!isValidUserRole(body.role)) {
        return NextResponse.json(
          { message: "Invalid user role." },
          { status: 400 }
        );
      }

      user.role = body.role as UserRole;
    }

    // Ako korisnik menja lozinku, prvo je hashujemo.
    if (body.password) {
      user.password = await bcrypt.hash(body.password, 10);
    }

    await em.flush();

    return NextResponse.json({
      message: "User updated successfully.",
      data: formatUser(user),
    });
  } catch (error) {
    console.error("Update user error:", error);

    return NextResponse.json(
      { message: "Failed to update user." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const currentUser = await getCurrentUser();

    // Samo admin može da briše korisnike.
    if (!hasRole(currentUser, [UserRole.ADMIN])) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    const { id } = await context.params;
    const userId = Number(id);

    if (Number.isNaN(userId)) {
      return NextResponse.json({ message: "Invalid ID." }, { status: 400 });
    }

    const em = await getEntityManager();

    const user = await em.findOne(User, {
      id: userId,
    });

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    em.remove(user);
    await em.flush();

    return NextResponse.json({
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    return NextResponse.json(
      { message: "Failed to delete user. User may have related data." },
      { status: 500 }
    );
  }
}