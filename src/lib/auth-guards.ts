import { connection } from "next/server";
import { auth } from "@/auth";
import { UserRole } from "@prisma/client";

export async function getCurrentSession() {
  return auth();
}

export async function requireCustomerSession() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export function isAdminRole(role?: UserRole | string | null): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export async function requireAdminSession() {
  await connection();
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }
  if (!isAdminRole(session.user.role)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}

