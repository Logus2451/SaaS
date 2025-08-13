"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SUBSCRIPTION_PLANS, getPlanById } from "@/lib/billing/plans"
import { supabase } from "@/lib/supabase/client"
import { CreditCard, TrendingUp, Building2 } from "lucide-react"

interface HotelSubscription {
  id: string
  name: string
  email: string
  subscription_plan: string
  subscription_status: string
  billing_cycle_start: string
  billing_cycle_end: string
  is_active: boolean
}

export default function SubscriptionManagement() {
  const [hotels, setHotels] = useState<HotelSubscription[]>([])
  const [selectedHotel, setSelectedHotel] = useState<HotelSubscription | null>(null)
  const [newPlan, setNewPlan] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHotels()
  }, [])

  const loadHotels = async () => {
    try {
      const { data } = await supabase
        .from("hotels")
        .select(
          "id, name, email, subscription_plan, subscription_status, billing_cycle_start, billing_cycle_end, is_active",
        )
        .order("created_at", { ascending: false })

      setHotels(data || [])
    } catch (error) {
      console.error("Error loading hotels:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateSubscription = async (hotelId: string, planId: string) => {
    try {
      const plan = getPlanById(planId)
      if (!plan) return

      const now = new Date()
      const cycleEnd = new Date(now)
      cycleEnd.setMonth(cycleEnd.getMonth() + 1)

      await supabase
        .from("hotels")
        .update({
          subscription_plan: planId,
          subscription_status: "active",
          billing_cycle_start: now.toISOString(),
          billing_cycle_end: cycleEnd.toISOString(),
        })
        .eq("id", hotelId)

      // Create billing record
      await supabase.from("billing_records").insert({
        hotel_id: hotelId,
        amount: plan.price,
        plan_name: plan.name,
        billing_period_start: now.toISOString(),
        billing_period_end: cycleEnd.toISOString(),
        status: "pending",
        due_date: cycleEnd.toISOString(),
      })

      loadHotels()
      setSelectedHotel(null)
    } catch (error) {
      console.error("Error updating subscription:", error)
    }
  }

  const getPlanBadge = (planId: string) => {
    const plan = getPlanById(planId)
    if (!plan) return <Badge variant="secondary">Unknown</Badge>

    const colors = {
      free: "bg-gray-100 text-gray-800",
      starter: "bg-blue-100 text-blue-800",
      pro: "bg-purple-100 text-purple-800",
      enterprise: "bg-gold-100 text-gold-800",
    }

    return (
      <Badge className={colors[planId as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {plan.name}
        {plan.price > 0 && ` - $${plan.price}/mo`}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
      suspended: "bg-orange-100 text-orange-800",
    }

    return (
      <Badge className={colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  // Calculate stats
  const totalMRR = hotels
    .filter((h) => h.subscription_status === "active")
    .reduce((sum, hotel) => {
      const plan = getPlanById(hotel.subscription_plan)
      return sum + (plan?.price || 0)
    }, 0)

  const planDistribution = SUBSCRIPTION_PLANS.map((plan) => ({
    ...plan,
    count: hotels.filter((h) => h.subscription_plan === plan.id).length,
  }))

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Subscription Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalMRR.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +15% from last month
            </p>
          </CardContent>
        </Card>

        {planDistribution.slice(1).map((plan) => (
          <Card key={plan.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{plan.name} Plan</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{plan.count}</div>
              <p className="text-xs text-muted-foreground">${(plan.price * plan.count).toLocaleString()}/mo revenue</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plan Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plan Distribution</CardTitle>
          <CardDescription>Overview of hotels by subscription plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {planDistribution.map((plan) => (
              <div key={plan.id} className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{plan.count}</div>
                <div className="text-sm font-medium">{plan.name}</div>
                <div className="text-xs text-muted-foreground">{plan.price > 0 ? `$${plan.price}/mo` : "Free"}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hotels Subscription Table */}
      <Card>
        <CardHeader>
          <CardTitle>Hotel Subscriptions</CardTitle>
          <CardDescription>Manage subscription plans for all hotels</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hotel</TableHead>
                <TableHead>Current Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Billing Cycle</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hotels.map((hotel) => (
                <TableRow key={hotel.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{hotel.name}</div>
                      <div className="text-sm text-muted-foreground">{hotel.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getPlanBadge(hotel.subscription_plan)}</TableCell>
                  <TableCell>{getStatusBadge(hotel.subscription_status)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {hotel.billing_cycle_start && (
                        <>
                          {new Date(hotel.billing_cycle_start).toLocaleDateString()} -{" "}
                          {new Date(hotel.billing_cycle_end).toLocaleDateString()}
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => setSelectedHotel(hotel)}>
                          Change Plan
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Change Subscription Plan</DialogTitle>
                          <DialogDescription>Update the subscription plan for {hotel.name}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Current Plan</label>
                            <div className="mt-1">{getPlanBadge(hotel.subscription_plan)}</div>
                          </div>
                          <div>
                            <label className="text-sm font-medium">New Plan</label>
                            <Select value={newPlan} onValueChange={setNewPlan}>
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select a plan" />
                              </SelectTrigger>
                              <SelectContent>
                                {SUBSCRIPTION_PLANS.map((plan) => (
                                  <SelectItem key={plan.id} value={plan.id}>
                                    {plan.name} - ${plan.price}/mo
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setSelectedHotel(null)}>
                              Cancel
                            </Button>
                            <Button onClick={() => updateSubscription(hotel.id, newPlan)} disabled={!newPlan}>
                              Update Plan
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
