import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { getEntityManager } from "@/helpers/mikroOrm";
import { User, UserRole } from "@/entities/User";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
};

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export function createToken(user: AuthUser) {
  return jwt.sign(user, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  const decodedUser = verifyToken(token);

  if (!decodedUser) {
    return null;
  }

  const em = await getEntityManager();

  const user = await em.findOne(User, {
    id: decodedUser.id,
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export function hasRole(user: AuthUser | null, allowedRoles: UserRole[]) {
  if (!user) {
    return false;
  }

  return allowedRoles.includes(user.role);
}