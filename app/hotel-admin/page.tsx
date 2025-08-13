import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import HotelOwnerDashboard from "@/components/hotel-admin/dashboard"

export default async function HotelAdminPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (userData?.role !== "hotel_owner") {
    redirect("/")
  }

  // Get hotel data for this owner
  const { data: hotel } = await supabase.from("hotels").select("*").eq("owner_id", user.id).single()

  if (!hotel) {
    redirect("/")
  }

  return <HotelOwnerDashboard hotel={hotel} />
}
