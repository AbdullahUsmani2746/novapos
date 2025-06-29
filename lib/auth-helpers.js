import { getServerSession } from "next-auth"
import { authOptions } from "./auth"

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

export function hasRole(userRole, allowedRoles) {
  return allowedRoles.includes(userRole)
}

export function redirectByRole(role) {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard"
    case "MANAGER":
      return "/dashboard"
    case "ACCOUNTANT":
      return "/pos"
    case "CASHIER":
      return "/pos"
    default:
      return "/dashboard"
  }
}