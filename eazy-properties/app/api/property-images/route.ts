import { NextRequest, NextResponse } from "next/server";
import { getEntityManager } from "@/helpers/mikroOrm";
import { getCurrentUser, hasRole } from "@/helpers/auth";

import { UserRole } from "@/entities/User";
import { Property } from "@/entities/Property";
import { PropertyImage } from "@/entities/PropertyImage";

export async function GET() {
  try {
    const em = await getEntityManager();

    const images = await em.find(
      PropertyImage,
      {},
      {
        populate: ["property"],
        orderBy: {
          id: "asc",
        },
      }
    );

    const cleanImages = images.map((image) => ({
      id: image.id,
      imageUrl: image.imageUrl,
      property: {
        id: image.property.id,
        title: image.property.title,
        city: image.property.city,
        address: image.property.address,
        price: image.property.price,
      },
    }));

    return NextResponse.json({ data: cleanImages });
  } catch (error) {
    console.error("Get property images error:", error);

    return NextResponse.json(
      { message: "Failed to get property images." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    // Samo admin i agent mogu da dodaju slike.
    if (!hasRole(currentUser, [UserRole.ADMIN, UserRole.AGENT])) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    const body = await request.json();

    if (!body.imageUrl || !body.propertyId) {
      return NextResponse.json(
        { message: "Image URL and property ID are required." },
        { status: 400 }
      );
    }

    const em = await getEntityManager();

    const property = await em.findOne(
      Property,
      {
        id: Number(body.propertyId),
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

    // Agent može dodati slike samo za svoje nekretnine.
    if (
      currentUser!.role === UserRole.AGENT &&
      property.agent.id !== currentUser!.id
    ) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    const image = em.create(PropertyImage, {
      imageUrl: body.imageUrl,
      property,
    });

    // Čuvamo novu sliku u bazu.
    em.persist(image);
    await em.flush();

    return NextResponse.json({
      message: "Property image created successfully.",
      data: {
        id: image.id,
        imageUrl: image.imageUrl,
        property: {
          id: property.id,
          title: property.title,
          city: property.city,
        },
      },
    });
  } catch (error) {
    console.error("Create property image error:", error);

    return NextResponse.json(
      { message: "Failed to create property image." },
      { status: 500 }
    );
  }
}