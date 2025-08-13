export type UserRole = "super_admin" | "hotel_owner" | "hotel_staff" | "guest"

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  hotel_id?: string
  created_at: string
  updated_at: string
}

export const ROLE_PERMISSIONS = {
  super_admin: ["manage_all_hotels", "manage_subscriptions", "view_all_analytics", "manage_users"],
  hotel_owner: ["manage_own_hotel", "manage_hotel_staff", "view_hotel_analytics", "manage_bookings"],
  hotel_staff: ["view_hotel_data", "manage_bookings", "manage_rooms"],
  guest: ["make_bookings", "view_own_bookings"],
} as const

export function hasPermission(userRole: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission as any) || false
}

export function canAccessRoute(userRole: UserRole, pathname: string): boolean {
  if (pathname.startsWith("/super-admin")) {
    return userRole === "super_admin"
  }

  if (pathname.startsWith("/hotel-admin")) {
    return ["hotel_owner", "hotel_staff"].includes(userRole)
  }

  // Public routes accessible to all
  if (pathname === "/" || pathname.startsWith("/hotels") || pathname.startsWith("/auth")) {
    return true
  }

  return true
}
