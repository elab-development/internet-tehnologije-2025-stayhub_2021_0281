import jwt, { type JwtPayload as LibJwtPayload } from "jsonwebtoken";

export type Role = "BUYER" | "SELLER" | "ADMIN";

export type JwtPayload = {
  sub: number;
  role: Role;
};

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30m" });
}

function isRole(v: unknown): v is Role {
  return v === "BUYER" || v === "SELLER" || v === "ADMIN";
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, JWT_SECRET);

  // jsonwebtoken može vratiti string ili objekat.
  if (typeof decoded === "string") {
    throw Object.assign(new Error("UNAUTHORIZED"), { status: 401 });
  }

  const obj = decoded as LibJwtPayload & Record<string, unknown>;

  // sub može biti string/number u JWT standardu, pa normalizuje.
  const subRaw = obj.sub;
  const sub =
    typeof subRaw === "number"
      ? subRaw
      : typeof subRaw === "string"
      ? Number(subRaw)
      : NaN;

  const role = obj.role;

  if (!Number.isInteger(sub) || sub <= 0 || !isRole(role)) {
    throw Object.assign(new Error("UNAUTHORIZED"), { status: 401 });
  }

  return { sub, role };
}
