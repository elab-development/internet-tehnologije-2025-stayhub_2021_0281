import { NextRequest, NextResponse } from "next/server";
import { getEntityManager } from "@/helpers/mikroOrm";
import { getCurrentUser, hasRole } from "@/helpers/auth";

import { UserRole } from "@/entities/User";
import { PropertyImage } from "@/entities/PropertyImage";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function formatPropertyImage(image: PropertyImage) {
  return {
    id: image.id,
    imageUrl: image.imageUrl,
    property: {
      id: image.property.id,
      title: image.property.title,
      city: image.property.city,
      address: image.property.address,
      price: image.property.price,
      agent: {
        id: image.property.agent.id,
        name: image.property.agent.name,
        email: image.property.agent.email,
        role: image.property.agent.role,
      },
    },
  };
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const imageId = Number(id);

    if (Number.isNaN(imageId)) {
      return NextResponse.json({ message: "Invalid ID." }, { status: 400 });
    }

    const em = await getEntityManager();

    const image = await em.findOne(
      PropertyImage,
      {
        id: imageId,
      },
      {
        populate: ["property", "property.agent"],
      }
    );

    if (!image) {
      return NextResponse.json(
        { message: "Property image not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: formatPropertyImage(image),
    });
  } catch (error) {
    console.error("Get property image error:", error);

    return NextResponse.json(
      { message: "Failed to get property image." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const currentUser = await getCurrentUser();

    // Samo admin i agent mogu da menjaju slike.
    if (!hasRole(currentUser, [UserRole.ADMIN, UserRole.AGENT])) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    const { id } = await context.params;
    const imageId = Number(id);

    if (Number.isNaN(imageId)) {
      return NextResponse.json({ message: "Invalid ID." }, { status: 400 });
    }

    const em = await getEntityManager();

    const image = await em.findOne(
      PropertyImage,
      {
        id: imageId,
      },
      {
        populate: ["property", "property.agent"],
      }
    );

    if (!image) {
      return NextResponse.json(
        { message: "Property image not found." },
        { status: 404 }
      );
    }

    // Agent može menjati slike samo za svoje nekretnine.
    if (
      currentUser!.role === UserRole.AGENT &&
      image.property.agent.id !== currentUser!.id
    ) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    const body = await request.json();

    if (!body.imageUrl) {
      return NextResponse.json(
        { message: "Image URL is required." },
        { status: 400 }
      );
    }

    image.imageUrl = body.imageUrl;

    // Čuvamo izmenu slike.
    await em.flush();

    return NextResponse.json({
      message: "Property image updated successfully.",
      data: formatPropertyImage(image),
    });
  } catch (error) {
    console.error("Update property image error:", error);

    return NextResponse.json(
      { message: "Failed to update property image." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const currentUser = await getCurrentUser();

    // Samo admin i agent mogu da brišu slike.
    if (!hasRole(currentUser, [UserRole.ADMIN, UserRole.AGENT])) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    const { id } = await context.params;
    const imageId = Number(id);

    if (Number.isNaN(imageId)) {
      return NextResponse.json({ message: "Invalid ID." }, { status: 400 });
    }

    const em = await getEntityManager();

    const image = await em.findOne(
      PropertyImage,
      {
        id: imageId,
      },
      {
        populate: ["property", "property.agent"],
      }
    );

    if (!image) {
      return NextResponse.json(
        { message: "Property image not found." },
        { status: 404 }
      );
    }

    // Agent može brisati slike samo za svoje nekretnine.
    if (
      currentUser!.role === UserRole.AGENT &&
      image.property.agent.id !== currentUser!.id
    ) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    // Brišemo sliku iz baze.
    em.remove(image);
    await em.flush();

    return NextResponse.json({
      message: "Property image deleted successfully.",
    });
  } catch (error) {
    console.error("Delete property image error:", error);

    return NextResponse.json(
      { message: "Failed to delete property image." },
      { status: 500 }
    );
  }
}