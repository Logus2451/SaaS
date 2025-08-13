"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth/client"
import { SUBSCRIPTION_PLANS, getPlanById } from "@/lib/billing/plans"
import { CreditCard, AlertTriangle, CheckCircle, Zap } from "lucide-react"

interface HotelUsage {
  roomCount: number
  bookingCount: number
  staffCount: number
}

export default function SubscriptionStatus() {
  const { user } = useAuth()
  const [hotel, setHotel] = useState<any>(null)
  const [usage, setUsage] = useState<HotelUsage>({ roomCount: 0, bookingCount: 0, staffCount: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.hotel_id) {
      loadHotelData()
    }
  }, [user])

  const loadHotelData = async () => {
    try {
      // Get hotel subscription info
      const { data: hotelData } = await supabase.from("hotels").select("*").eq("id", user?.hotel_id).single()

      setHotel(hotelData)

      // Get usage statistics
      const [roomsResult, bookingsResult, staffResult] = await Promise.all([
        supabase.from("rooms").select("id").eq("hotel_id", user?.hotel_id),
        supabase.from("bookings").select("id").eq("hotel_id", user?.hotel_id),
        supabase.from("users").select("id").eq("hotel_id", user?.hotel_id),
      ])

      setUsage({
        roomCount: roomsResult.data?.length || 0,
        bookingCount: bookingsResult.data?.length || 0,
        staffCount: staffResult.data?.length || 0,
      })
    } catch (error) {
      console.error("Error loading hotel data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>
  }

  if (!hotel) {
    return <div className="text-center p-8">Hotel information not found</div>
  }

  const currentPlan = getPlanById(hotel.subscription_plan)
  if (!currentPlan) {
    return <div className="text-center p-8">Invalid subscription plan</div>
  }

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0 // unlimited
    return Math.min((current / limit) * 100, 100)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500"
    if (percentage >= 75) return "bg-yellow-500"
    return "bg-green-500"
  }

  const isNearLimit = (current: number, limit: number) => {
    if (limit === -1) return false
    return current >= limit * 0.8
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Current Subscription
              </CardTitle>
              <CardDescription>Your current plan and billing information</CardDescription>
            </div>
            {currentPlan.popular && (
              <Badge className="bg-purple-100 text-purple-800">
                <Zap className="h-3 w-3 mr-1" />
                Popular
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">{currentPlan.name}</h3>
              <p className="text-muted-foreground">
                ${currentPlan.price}/{currentPlan.interval}
              </p>
            </div>
            <Badge
              className={
                hotel.subscription_status === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
              }
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              {hotel.subscription_status}
            </Badge>
          </div>

          {hotel.billing_cycle_end && (
            <div className="text-sm text-muted-foreground">
              Next billing date: {new Date(hotel.billing_cycle_end).toLocaleDateString()}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Plan Features</h4>
              <ul className="text-sm space-y-1">
                {currentPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Usage & Limits</CardTitle>
          <CardDescription>Monitor your current usage against plan limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Rooms Usage */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Rooms</span>
              <span className="text-sm text-muted-foreground">
                {usage.roomCount} / {currentPlan.limits.maxRooms === -1 ? "Unlimited" : currentPlan.limits.maxRooms}
              </span>
            </div>
            {currentPlan.limits.maxRooms !== -1 && (
              <Progress value={getUsagePercentage(usage.roomCount, currentPlan.limits.maxRooms)} className="h-2" />
            )}
            {isNearLimit(usage.roomCount, currentPlan.limits.maxRooms) && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>You're approaching your room limit. Consider upgrading your plan.</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Bookings Usage */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Monthly Bookings</span>
              <span className="text-sm text-muted-foreground">
                {usage.bookingCount} /{" "}
                {currentPlan.limits.maxBookings === -1 ? "Unlimited" : currentPlan.limits.maxBookings}
              </span>
            </div>
            {currentPlan.limits.maxBookings !== -1 && (
              <Progress
                value={getUsagePercentage(usage.bookingCount, currentPlan.limits.maxBookings)}
                className="h-2"
              />
            )}
          </div>

          {/* Staff Usage */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Staff Members</span>
              <span className="text-sm text-muted-foreground">
                {usage.staffCount} / {currentPlan.limits.maxStaff === -1 ? "Unlimited" : currentPlan.limits.maxStaff}
              </span>
            </div>
            {currentPlan.limits.maxStaff !== -1 && (
              <Progress value={getUsagePercentage(usage.staffCount, currentPlan.limits.maxStaff)} className="h-2" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Options */}
      {currentPlan.id !== "enterprise" && (
        <Card>
          <CardHeader>
            <CardTitle>Upgrade Your Plan</CardTitle>
            <CardDescription>Get more features and higher limits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SUBSCRIPTION_PLANS.filter((plan) => plan.price > currentPlan.price)
                .slice(0, 2)
                .map((plan) => (
                  <div key={plan.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{plan.name}</h4>
                      {plan.popular && <Badge className="bg-purple-100 text-purple-800">Popular</Badge>}
                    </div>
                    <p className="text-2xl font-bold mb-2">${plan.price}/mo</p>
                    <ul className="text-sm space-y-1 mb-4">
                      {plan.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full bg-transparent" variant="outline">
                      Upgrade to {plan.name}
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
