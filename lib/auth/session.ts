import { cookies } from "next/headers"
import { verifyToken, type AuthUser } from "./auth"

const SESSION_COOKIE_NAME = "auth-token"
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: "/",
}

// Set session cookie
export function setSessionCookie(token: string) {
  const cookieStore = cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, COOKIE_OPTIONS)
}

// Get session cookie
export function getSessionCookie(): string | null {
  const cookieStore = cookies()
  const cookie = cookieStore.get(SESSION_COOKIE_NAME)
  return cookie?.value || null
}

// Remove session cookie
export function removeSessionCookie() {
  const cookieStore = cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

// Get current user from session
export function getCurrentUser(): AuthUser | null {
  const token = getSessionCookie()
  if (!token) return null

  return verifyToken(token)
}

// Check if user has required role
export function hasRole(user: AuthUser | null, requiredRole: string | string[]): boolean {
  if (!user) return false

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  return roles.includes(user.role)
}

// Check if user can access hotel data
export function canAccessHotel(user: AuthUser | null, hotelId: string): boolean {
  if (!user) return false

  // Super admin can access all hotels
  if (user.role === "super_admin") return true

  // Hotel owner/staff can only access their own hotel
  return user.hotel_id === hotelId
}
