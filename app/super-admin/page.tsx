import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import SuperAdminDashboard from "@/components/super-admin/dashboard"

export default async function SuperAdminPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (userData?.role !== "super_admin") {
    redirect("/")
  }

  return <SuperAdminDashboard />
}
