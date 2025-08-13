import { getCurrentUser as getSessionUser } from "./session"
import { userQueries, hotelQueries } from "@/lib/database/queries"
import { redirect } from "next/navigation"
import type { AuthUser } from "./auth"

export type UserRole = "super_admin" | "hotel_owner" | "hotel_staff" | "guest"

export interface UserProfile extends AuthUser {
  created_at?: Date
  updated_at?: Date
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  return getSessionUser()
}

export async function requireAuth(): Promise<UserProfile> {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  return user
}

export async function requireRole(allowedRoles: UserRole[]): Promise<UserProfile> {
  const user = await requireAuth()

  if (!allowedRoles.includes(user.role)) {
    redirect("/unauthorized")
  }

  return user
}

export async function requireSuperAdmin(): Promise<UserProfile> {
  return requireRole(["super_admin"])
}

export async function requireHotelAccess(): Promise<UserProfile> {
  return requireRole(["hotel_owner", "hotel_staff"])
}

export async function getUserHotel(userId: string) {
  try {
    const user = await userQueries.findById(userId)
    if (!user || !user.hotel_id) {
      return null
    }

    const hotel = await hotelQueries.findById(user.hotel_id)
    return hotel
  } catch (error) {
    console.error("Error fetching user hotel:", error)
    return null
  }
}
