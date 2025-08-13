"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase/client"
import { Search, ExternalLink, Settings } from "lucide-react"

interface Hotel {
  id: string
  name: string
  slug: string
  city: string
  state: string
  subscription_plan: string
  is_active: boolean
  created_at: string
  owner: {
    full_name: string
    email: string
  }
}

interface HotelsListProps {
  onRefresh: () => void
}

export default function HotelsList({ onRefresh }: HotelsListProps) {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPlan, setFilterPlan] = useState("all")

  useEffect(() => {
    loadHotels()
  }, [])

  const loadHotels = async () => {
    try {
      const { data, error } = await supabase
        .from("hotels")
        .select(`
          id,
          name,
          slug,
          city,
          state,
          subscription_plan,
          is_active,
          created_at,
          users!hotels_owner_id_fkey (
            full_name,
            email
          )
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading hotels:", error)
        return
      }

      const formattedHotels =
        data?.map((hotel) => ({
          ...hotel,
          owner: hotel.users as any,
        })) || []

      setHotels(formattedHotels)
    } catch (error) {
      console.error("Error loading hotels:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleHotelStatus = async (hotelId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from("hotels").update({ is_active: !currentStatus }).eq("id", hotelId)

      if (error) {
        console.error("Error updating hotel status:", error)
        return
      }

      await loadHotels()
      onRefresh()
    } catch (error) {
      console.error("Error updating hotel status:", error)
    }
  }

  const filteredHotels = hotels.filter((hotel) => {
    const matchesSearch =
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.owner.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.city.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesPlan = filterPlan === "all" || hotel.subscription_plan === filterPlan

    return matchesSearch && matchesPlan
  })

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "free":
        return "bg-gray-100 text-gray-800"
      case "starter":
        return "bg-blue-100 text-blue-800"
      case "pro":
        return "bg-purple-100 text-purple-800"
      case "enterprise":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading hotels...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Hotels Management</CardTitle>
          <CardDescription>Manage all hotels on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search hotels, owners, or cities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterPlan} onValueChange={setFilterPlan}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Hotels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHotels.map((hotel) => (
          <Card key={hotel.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{hotel.name}</CardTitle>
                  <CardDescription>
                    {hotel.city}, {hotel.state}
                  </CardDescription>
                </div>
                <Badge
                  variant={hotel.is_active ? "default" : "secondary"}
                  className={hotel.is_active ? "bg-green-100 text-green-800" : ""}
                >
                  {hotel.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Owner</p>
                  <p className="text-sm text-muted-foreground">{hotel.owner.full_name}</p>
                  <p className="text-sm text-muted-foreground">{hotel.owner.email}</p>
                </div>

                <div className="flex justify-between items-center">
                  <Badge className={getPlanColor(hotel.subscription_plan)}>
                    {hotel.subscription_plan.charAt(0).toUpperCase() + hotel.subscription_plan.slice(1)}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    Created {new Date(hotel.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant={hotel.is_active ? "destructive" : "default"}
                    onClick={() => toggleHotelStatus(hotel.id, hotel.is_active)}
                  >
                    {hotel.is_active ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredHotels.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No hotels found matching your criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
