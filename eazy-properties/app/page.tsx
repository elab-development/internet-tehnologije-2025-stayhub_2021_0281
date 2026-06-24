import { redirect } from "next/navigation";

export default function Page() {
  // Korisnika odmah šaljemo na auth stranicu.
  redirect("/auth");
}