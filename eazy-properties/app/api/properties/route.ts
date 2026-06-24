import { NextRequest, NextResponse } from "next/server";
import { getEntityManager } from "@/helpers/mikroOrm";
import { getCurrentUser, hasRole } from "@/helpers/auth";

import { UserRole } from "@/entities/User";
import { Property } from "@/entities/Property";
import { User } from "@/entities/User";

export async function GET() {
  try {
    const em = await getEntityManager();

    // Svi mogu da vide nekretnine.
    const properties = await em.find(
      Property,
      {},
      {
        populate: ["agent", "images", "reservations", "reviews"],
        orderBy: {
          id: "asc",
        },
      }
    );

    const cleanProperties = properties.map((property) => ({
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
    }));

    return NextResponse.json({ data: cleanProperties });
  } catch (error) {
    console.error("Get properties error:", error);

    return NextResponse.json(
      { message: "Failed to get properties." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    // Samo admin i agent mogu da dodaju nekretnine.
    if (!hasRole(currentUser, [UserRole.ADMIN, UserRole.AGENT])) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    const body = await request.json();

    if (
      !body.title ||
      !body.description ||
      !body.city ||
      !body.address ||
      !body.price ||
      !body.imageUrl
    ) {
      return NextResponse.json(
        { message: "Required property fields are missing." },
        { status: 400 }
      );
    }

    const em = await getEntityManager();

    // Ulogovani admin/agent postaje vlasnik nekretnine.
    const agent = await em.findOne(User, {
      id: currentUser!.id,
    });

    if (!agent) {
      return NextResponse.json(
        { message: "Agent user was not found." },
        { status: 404 }
      );
    }

    const property = em.create(Property, {
      title: body.title,
      description: body.description,
      city: body.city,
      address: body.address,
      price: Number(body.price),
      imageUrl: body.imageUrl,
      panoramaUrl: body.panoramaUrl || undefined,
      model3dUrl: body.model3dUrl || undefined,
      createdAt: new Date(),
      agent,
    });

    // Čuvamo novu nekretninu u bazu.
    em.persist(property);
    await em.flush();

    return NextResponse.json({
      message: "Property created successfully.",
      data: {
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
          id: agent.id,
          name: agent.name,
          email: agent.email,
          role: agent.role,
        },
      },
    });
  } catch (error) {
    console.error("Create property error:", error);

    return NextResponse.json(
      { message: "Failed to create property." },
      { status: 500 }
    );
  }
}