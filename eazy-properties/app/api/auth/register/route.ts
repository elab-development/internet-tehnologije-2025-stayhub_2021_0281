import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getEntityManager } from "@/helpers/mikroOrm";
import { User, UserRole } from "@/entities/User";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, email, password, role } = body;

    // Proveravamo da li su osnovna polja poslata.
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email and password are required." },
        { status: 400 }
      );
    }

    const em = await getEntityManager();

    // Proveravamo da li već postoji korisnik sa ovom email adresom.
    const existingUser = await em.findOne(User, {
      email,
    });

    // Email mora biti jedinstven.
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Ako rola nije poslata, korisnik je CLIENT.
    const selectedRole: UserRole = role || UserRole.CLIENT;

    const user = em.create(User, {
      name,
      email,
      password: hashedPassword,
      role: selectedRole,
      createdAt: new Date(),
    });

    // Čuvamo novog korisnika u bazu.
    em.persist(user);
    await em.flush();

    return NextResponse.json({
      message: "User registered successfully.",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    return NextResponse.json(
      { message: "Register failed." },
      { status: 500 }
    );
  }
}