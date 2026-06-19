import { NextRequest, NextResponse } from "next/server";
import { getNearbyPlacesData } from "@/helpers/externalApi";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const city = searchParams.get("city") || "";
    const address = searchParams.get("address") || "";
    const category = searchParams.get("category") || "catering.restaurant";

    const result = await getNearbyPlacesData(city, address, category);

    if (!result.ok) {
      return NextResponse.json(
        {
          message: result.message,
          error: result.error,
        },
        { status: result.status || 500 }
      );
    }

    return NextResponse.json({
      data: result.data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load nearby places.";

    return NextResponse.json({ message }, { status: 500 });
  }
}