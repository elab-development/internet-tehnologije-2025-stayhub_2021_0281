import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getEntityManager } from "@/helpers/mikroOrm";
import { getCurrentUser, hasRole } from "@/helpers/auth";

import { User, UserRole } from "@/entities/User";

function formatUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

function isValidUserRole(role: string) {
  return Object.values(UserRole).includes(role as UserRole);
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    // Samo admin može da vidi sve korisnike.
    if (!hasRole(currentUser, [UserRole.ADMIN])) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    const em = await getEntityManager();

    const users = await em.find(
      User,
      {},
      {
        orderBy: {
          id: "asc",
        },
      }
    );

    return NextResponse.json({
      data: users.map(formatUser),
    });
  } catch (error) {
    console.error("Get users error:", error);

    return NextResponse.json(
      { message: "Failed to get users." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    // Samo admin može da kreira korisnike preko ove rute.
    if (!hasRole(currentUser, [UserRole.ADMIN])) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    const body = await request.json();

    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: "Name, email, password and role are required." },
        { status: 400 }
      );
    }

    if (!isValidUserRole(role)) {
      return NextResponse.json(
        { message: "Invalid user role." },
        { status: 400 }
      );
    }

    const em = await getEntityManager();

    const existingUser = await em.findOne(User, {
      email,
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = em.create(User, {
      name,
      email,
      password: hashedPassword,
      role: role as UserRole,
      createdAt: new Date(),
    });

    // Čuvamo novog korisnika u bazu.
    em.persist(user);
    await em.flush();

    return NextResponse.json({
      message: "User created successfully.",
      data: formatUser(user),
    });
  } catch (error) {
    console.error("Create user error:", error);

    return NextResponse.json(
      { message: "Failed to create user." },
      { status: 500 }
    );
  }
}