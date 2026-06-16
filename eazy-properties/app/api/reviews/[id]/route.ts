import { NextRequest, NextResponse } from "next/server";
import { getEntityManager } from "@/helpers/mikroOrm";
import { getCurrentUser } from "@/helpers/auth";

import { UserRole } from "@/entities/User";
import { Review } from "@/entities/Review";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const reviewId = Number(id);

    if (Number.isNaN(reviewId)) {
      return NextResponse.json({ message: "Invalid ID." }, { status: 400 });
    }

    const em = await getEntityManager();

    const review = await em.findOne(
      Review,
      {
        id: reviewId,
      },
      {
        populate: ["client", "property"],
      }
    );

    if (!review) {
      return NextResponse.json(
        { message: "Review not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: formatReview(review),
    });
  } catch (error) {
    console.error("Get review error:", error);

    return NextResponse.json(
      { message: "Failed to get review." },
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
    const reviewId = Number(id);

    if (Number.isNaN(reviewId)) {
      return NextResponse.json({ message: "Invalid ID." }, { status: 400 });
    }

    const em = await getEntityManager();

    const review = await em.findOne(
      Review,
      {
        id: reviewId,
      },
      {
        populate: ["client", "property"],
      }
    );

    if (!review) {
      return NextResponse.json(
        { message: "Review not found." },
        { status: 404 }
      );
    }

    // Klijent može menjati samo svoju recenziju.
    if (currentUser.role === UserRole.CLIENT && review.client.id !== currentUser.id) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    // Agent ne menja recenzije.
    if (currentUser.role === UserRole.AGENT) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    const body = await request.json();

    if (body.rating) {
      review.rating = Number(body.rating);
    }

    if (body.comment) {
      review.comment = body.comment;
    }

    await em.flush();

    return NextResponse.json({
      message: "Review updated successfully.",
      data: formatReview(review),
    });
  } catch (error) {
    console.error("Update review error:", error);

    return NextResponse.json(
      { message: "Failed to update review." },
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
    const reviewId = Number(id);

    if (Number.isNaN(reviewId)) {
      return NextResponse.json({ message: "Invalid ID." }, { status: 400 });
    }

    const em = await getEntityManager();

    const review = await em.findOne(
      Review,
      {
        id: reviewId,
      },
      {
        populate: ["client", "property"],
      }
    );

    if (!review) {
      return NextResponse.json(
        { message: "Review not found." },
        { status: 404 }
      );
    }

    // Klijent može obrisati samo svoju recenziju.
    if (currentUser.role === UserRole.CLIENT && review.client.id !== currentUser.id) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    // Agent ne briše recenzije.
    if (currentUser.role === UserRole.AGENT) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    em.remove(review);
    await em.flush();

    return NextResponse.json({
      message: "Review deleted successfully.",
    });
  } catch (error) {
    console.error("Delete review error:", error);

    return NextResponse.json(
      { message: "Failed to delete review." },
      { status: 500 }
    );
  }
}