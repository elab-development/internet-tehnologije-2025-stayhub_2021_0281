import { NextRequest, NextResponse } from "next/server";
import { getElectricityCarbonData } from "@/helpers/externalApi";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const city = searchParams.get("city") || "";
    const requestedZone = searchParams.get("zone") || undefined;

    const result = await getElectricityCarbonData(city, requestedZone);

    if (!result.ok) {
      return NextResponse.json(
        {
          message: result.message,
          zone: result.zone,
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
      error instanceof Error
        ? error.message
        : "Failed to load electricity carbon data.";

    return NextResponse.json({ message }, { status: 500 });
  }
}