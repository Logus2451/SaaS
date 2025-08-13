"use client"

import type { AuthUser } from "./auth"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export type UserRole = "super_admin" | "hotel_owner" | "hotel_staff" | "guest"

export interface UserProfile extends AuthUser {
  created_at?: Date
  updated_at?: Date
}

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get current user from session
    const getCurrentUser = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const data = await response.json()
          if (data.user) {
            setUser(data.user)
          }
        }
      } catch (error) {
        console.error("Error fetching current user:", error)
      } finally {
        setLoading(false)
      }
    }

    getCurrentUser()
  }, [])

  const signOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      router.push("/auth/login")
      router.refresh()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const refreshUser = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          setUser(data.user)
        }
      }
    } catch (error) {
      console.error("Error refreshing user:", error)
    }
  }

  return {
    user,
    loading,
    signOut,
    refreshUser,
    isAuthenticated: !!user,
    isSuperAdmin: user?.role === "super_admin",
    isHotelOwner: user?.role === "hotel_owner",
    isHotelStaff: user?.role === "hotel_staff",
    isGuest: user?.role === "guest",
  }
}
