"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase/client"
import { Building2, Users, CreditCard, Plus, Settings, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import HotelOnboardingDialog from "./hotel-onboarding-dialog"
import HotelsList from "./hotels-list"
import BillingOverview from "./billing-overview"

interface DashboardStats {
  totalHotels: number
  activeHotels: number
  totalRevenue: number
  pendingPayments: number
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalHotels: 0,
    activeHotels: 0,
    totalRevenue: 0,
    pendingPayments: 0,
  })
  const [showOnboarding, setShowOnboarding] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // Get hotel stats
      const { data: hotels } = await supabase.from("hotels").select("id, is_active, subscription_plan")

      const totalHotels = hotels?.length || 0
      const activeHotels = hotels?.filter((h) => h.is_active).length || 0

      // Get billing stats (mock data for now)
      const totalRevenue = 12450.0
      const pendingPayments = 3

      setStats({
        totalHotels,
        activeHotels,
        totalRevenue,
        pendingPayments,
      })
    } catch (error) {
      console.error("Error loading stats:", error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Super Admin Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hotels</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalHotels}</div>
              <p className="text-xs text-muted-foreground">{stats.activeHotels} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Hotels</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeHotels}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.activeHotels / Math.max(stats.totalHotels, 1)) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingPayments}</div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="hotels" className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="hotels">Hotels</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            <Button onClick={() => setShowOnboarding(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Onboard Hotel
            </Button>
          </div>

          <TabsContent value="hotels">
            <HotelsList onRefresh={loadStats} />
          </TabsContent>

          <TabsContent value="billing">
            <BillingOverview />
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>Comprehensive analytics and reporting coming soon</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Analytics dashboard will be available in the next update</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <HotelOnboardingDialog open={showOnboarding} onOpenChange={setShowOnboarding} onSuccess={loadStats} />
    </div>
  )
}
