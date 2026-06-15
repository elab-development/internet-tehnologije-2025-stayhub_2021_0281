import { NextRequest, NextResponse } from "next/server";
import { getEntityManager } from "@/helpers/mikroOrm";
import { getCurrentUser, hasRole } from "@/helpers/auth";

import { Property } from "@/entities/Property";
import { UserRole } from "@/entities/User";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function formatProperty(property: Property) {
  return {
    id: property.id,
    title: property.title,
    description: property.description,
    city: property.city,
    address: property.address,
    price: property.price,
    imageUrl: property.imageUrl,
    panoramaUrl: property.panoramaUrl,
    model3dUrl: property.model3dUrl,
    createdAt: property.createdAt,

    agent: {
      id: property.agent.id,
      name: property.agent.name,
      email: property.agent.email,
      role: property.agent.role,
    },

    images: property.images.getItems().map((image) => ({
      id: image.id,
      imageUrl: image.imageUrl,
    })),

    reservations: property.reservations.getItems().map((reservation) => ({
      id: reservation.id,
      startDate: reservation.startDate,
      endDate: reservation.endDate,
      status: reservation.status,
      createdAt: reservation.createdAt,
    })),

    reviews: property.reviews.getItems().map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    })),
  };
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const propertyId = Number(id);

    if (Number.isNaN(propertyId)) {
      return NextResponse.json({ message: "Invalid ID." }, { status: 400 });
    }

    const em = await getEntityManager();

    const property = await em.findOne(
      Property,
      {
        id: propertyId,
      },
      {
        populate: ["agent", "images", "reservations", "reviews"],
      }
    );

    if (!property) {
      return NextResponse.json(
        { message: "Property not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: formatProperty(property),
    });
  } catch (error) {
    console.error("Get property error:", error);

    return NextResponse.json(
      { message: "Failed to get property." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const currentUser = await getCurrentUser();

    // Samo admin i agent mogu da menjaju nekretnine.
    if (!hasRole(currentUser, [UserRole.ADMIN, UserRole.AGENT])) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    const { id } = await context.params;
    const propertyId = Number(id);

    if (Number.isNaN(propertyId)) {
      return NextResponse.json({ message: "Invalid ID." }, { status: 400 });
    }

    const em = await getEntityManager();

    const property = await em.findOne(
      Property,
      {
        id: propertyId,
      },
      {
        populate: ["agent", "images", "reservations", "reviews"],
      }
    );

    if (!property) {
      return NextResponse.json(
        { message: "Property not found." },
        { status: 404 }
      );
    }

    // Agent može da menja samo svoje nekretnine.
    if (
      currentUser!.role === UserRole.AGENT &&
      property.agent.id !== currentUser!.id
    ) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    const body = await request.json();

    property.title = body.title;
    property.description = body.description;
    property.city = body.city;
    property.address = body.address;
    property.price = Number(body.price);
    property.imageUrl = body.imageUrl;
    property.panoramaUrl = body.panoramaUrl || undefined;
    property.model3dUrl = body.model3dUrl || undefined;

    // Čuvamo izmenjenu nekretninu.
    await em.flush();

    return NextResponse.json({
      message: "Property updated successfully.",
      data: formatProperty(property),
    });
  } catch (error) {
    console.error("Update property error:", error);

    return NextResponse.json(
      { message: "Failed to update property." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const currentUser = await getCurrentUser();

    // Samo admin i agent mogu da brišu nekretnine.
    if (!hasRole(currentUser, [UserRole.ADMIN, UserRole.AGENT])) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    const { id } = await context.params;
    const propertyId = Number(id);

    if (Number.isNaN(propertyId)) {
      return NextResponse.json({ message: "Invalid ID." }, { status: 400 });
    }

    const em = await getEntityManager();

    const property = await em.findOne(
      Property,
      {
        id: propertyId,
      },
      {
        populate: ["agent"],
      }
    );

    if (!property) {
      return NextResponse.json(
        { message: "Property not found." },
        { status: 404 }
      );
    }

    // Agent može da obriše samo svoje nekretnine.
    if (
      currentUser!.role === UserRole.AGENT &&
      property.agent.id !== currentUser!.id
    ) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    // Brišemo nekretninu iz baze.
    em.remove(property);
    await em.flush();

    return NextResponse.json({
      message: "Property deleted successfully.",
    });
  } catch (error) {
    console.error("Delete property error:", error);

    return NextResponse.json(
      { message: "Failed to delete property." },
      { status: 500 }
    );
  }
}