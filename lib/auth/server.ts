import { createClient } from "@/lib/supabase/server"
import type { UserProfile, UserRole } from "./roles"
import { redirect } from "next/navigation"

export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  // Get user profile with role information
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (!profile) {
    return null
  }

  return {
    id: profile.id,
    email: profile.email,
    role: profile.role as UserRole,
    hotel_id: profile.hotel_id,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  }
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
  const supabase = createClient()

  const { data: user } = await supabase.from("users").select("hotel_id, hotels(*)").eq("id", userId).single()

  return user?.hotels || null
}
