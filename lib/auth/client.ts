"use client"

import { createClient } from "@/lib/supabase/client"
import type { UserProfile, UserRole } from "./roles"
import { useEffect, useState } from "react"

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (authUser) {
        const { data: profile } = await supabase.from("users").select("*").eq("id", authUser.id).single()

        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            role: profile.role as UserRole,
            hotel_id: profile.hotel_id,
            created_at: profile.created_at,
            updated_at: profile.updated_at,
          })
        }
      }

      setLoading(false)
    }

    getUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase.from("users").select("*").eq("id", session.user.id).single()

        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            role: profile.role as UserRole,
            hotel_id: profile.hotel_id,
            created_at: profile.created_at,
            updated_at: profile.updated_at,
          })
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
    isSuperAdmin: user?.role === "super_admin",
    isHotelOwner: user?.role === "hotel_owner",
    isHotelStaff: user?.role === "hotel_staff",
    isGuest: user?.role === "guest",
  }
}
