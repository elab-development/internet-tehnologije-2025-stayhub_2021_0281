import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getEntityManager } from "@/helpers/mikroOrm";
import { createToken } from "@/helpers/auth";
import { User } from "@/entities/User";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { email, password } = body;

    // Login zahteva email i lozinku.
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    const em = await getEntityManager();

    // Tražimo korisnika po email adresi.
    const user = await em.findOne(User, {
      email,
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Poredimo unetu lozinku sa hashovanom lozinkom iz baze.
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const token = createToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      message: "Login successful.",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    // Token čuvamo u cookie-ju.
    response.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json({ message: "Login failed." }, { status: 500 });
  }
}