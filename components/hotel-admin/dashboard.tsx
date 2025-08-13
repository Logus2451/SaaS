"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase/client"
import { Building2, Bed, Calendar, Users, Settings, LogOut, Plus, UserCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import RoomTypesManagement from "./room-types-management"
import RoomsManagement from "./rooms-management"
import BookingsOverview from "./bookings-overview"
import HotelSettings from "./hotel-settings"
import CalendarView from "./calendar-view"
import { GuestManagement } from "./guest-management"

interface Hotel {
  id: string
  name: string
  slug: string
  description: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  subscription_plan: string
  is_active: boolean
}

interface DashboardStats {
  totalRooms: number
  availableRooms: number
  totalBookings: number
  todayCheckIns: number
  todayCheckOuts: number
  occupancyRate: number
}

interface HotelOwnerDashboardProps {
  hotel: Hotel
}

export default function HotelOwnerDashboard({ hotel }: HotelOwnerDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalRooms: 0,
    availableRooms: 0,
    totalBookings: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0,
    occupancyRate: 0,
  })
  const router = useRouter()

  useEffect(() => {
    loadStats()
  }, [hotel.id])

  const loadStats = async () => {
    try {
      // Get room stats
      const { data: rooms } = await supabase.from("rooms").select("id, status").eq("hotel_id", hotel.id)

      const totalRooms = rooms?.length || 0
      const availableRooms = rooms?.filter((r) => r.status === "available").length || 0

      // Get booking stats
      const { data: bookings } = await supabase
        .from("bookings")
        .select("id, status, check_in_date, check_out_date")
        .eq("hotel_id", hotel.id)

      const totalBookings = bookings?.length || 0
      const today = new Date().toISOString().split("T")[0]

      const todayCheckIns = bookings?.filter((b) => b.check_in_date === today).length || 0
      const todayCheckOuts = bookings?.filter((b) => b.check_out_date === today).length || 0

      const occupiedRooms = totalRooms - availableRooms
      const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0

      setStats({
        totalRooms,
        availableRooms,
        totalBookings,
        todayCheckIns,
        todayCheckOuts,
        occupancyRate,
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
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-gray-900">{hotel.name}</h1>
                <p className="text-sm text-gray-500">Hotel Management Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  Plan: {hotel.subscription_plan.charAt(0).toUpperCase() + hotel.subscription_plan.slice(1)}
                </p>
                <p className="text-xs text-gray-500">{hotel.is_active ? "Active" : "Inactive"}</p>
              </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
              <Bed className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRooms}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <Bed className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.availableRooms}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupancy</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.occupancyRate.toFixed(1)}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Check-ins Today</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.todayCheckIns}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Check-outs Today</CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.todayCheckOuts}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="room-types">Room Types</TabsTrigger>
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="guests">
              <UserCheck className="h-4 w-4 mr-2" />
              Guests
            </TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>Latest booking activity for your hotel</CardDescription>
                </CardHeader>
                <CardContent>
                  <BookingsOverview hotelId={hotel.id} limit={5} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Room Type
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Room
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Calendar
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Manage Guests
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Hotel Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarView hotelId={hotel.id} />
          </TabsContent>

          <TabsContent value="room-types">
            <RoomTypesManagement hotelId={hotel.id} onUpdate={loadStats} />
          </TabsContent>

          <TabsContent value="rooms">
            <RoomsManagement hotelId={hotel.id} onUpdate={loadStats} />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingsOverview hotelId={hotel.id} />
          </TabsContent>

          <TabsContent value="guests">
            <GuestManagement />
          </TabsContent>

          <TabsContent value="settings">
            <HotelSettings hotel={hotel} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
