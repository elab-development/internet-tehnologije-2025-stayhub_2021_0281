import type { Role } from "./role";

export type MeResponse = {
  user: null | {
    id: number;
    name: string;
    email: string;
    userRole: Role;
  };
};