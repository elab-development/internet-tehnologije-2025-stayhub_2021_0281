import { NextResponse } from "next/server";
import { getCurrentUser } from "@/helpers/auth";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { message: "Not authenticated." },
      { status: 401 }
    );
  }

  return NextResponse.json({
    data: user,
  });
}