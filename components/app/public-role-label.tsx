import type { UserRole } from "@/lib/types/database";

export function publicRoleLabel(role: UserRole) {
  if (role === "teen") return "Teen";
  if (role === "parent") return "Parent";
  return "Community";
}
