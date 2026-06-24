import { NextRequest, NextResponse } from "next/server";
import { getEntityManager } from "@/helpers/mikroOrm";
import { getCurrentUser, hasRole } from "@/helpers/auth";

import { User, UserRole } from "@/entities/User";
import { Property } from "@/entities/Property";
import { Review } from "@/entities/Review";

function formatReview(review: Review) {
  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    client: {
      id: review.client.id,
      name: review.client.name,
      email: review.client.email,
      role: review.client.role,
    },
    property: {
      id: review.property.id,
      title: review.property.title,
      city: review.property.city,
      address: review.property.address,
      price: review.property.price,
      imageUrl: review.property.imageUrl,
    },
  };
}

export async function GET() {
  try {
    const em = await getEntityManager();

    // Svi mogu da vide recenzije.
    const reviews = await em.find(
      Review,
      {},
      {
        populate: ["client", "property"],
        orderBy: {
          id: "asc",
        },
      }
    );

    return NextResponse.json({
      data: reviews.map(formatReview),
    });
  } catch (error) {
    console.error("Get reviews error:", error);

    return NextResponse.json(
      { message: "Failed to get reviews." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    // Samo klijent može da napiše recenziju.
    if (!hasRole(currentUser, [UserRole.CLIENT])) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    const body = await request.json();

    if (!body.rating || !body.comment || !body.propertyId) {
      return NextResponse.json(
        { message: "Rating, comment and property ID are required." },
        { status: 400 }
      );
    }

    const em = await getEntityManager();

    // Ulogovani klijent piše recenziju.
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

    const review = em.create(Review, {
      rating: Number(body.rating),
      comment: body.comment,
      createdAt: new Date(),
      client,
      property,
    });

    // Čuvamo novu recenziju u bazu.
    em.persist(review);
    await em.flush();

    return NextResponse.json({
      message: "Review created successfully.",
      data: formatReview(review),
    });
  } catch (error) {
    console.error("Create review error:", error);

    return NextResponse.json(
      { message: "Failed to create review." },
      { status: 500 }
    );
  }
}