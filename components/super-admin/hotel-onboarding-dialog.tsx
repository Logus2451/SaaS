"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase/client"

interface HotelOnboardingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function HotelOnboardingDialog({ open, onOpenChange, onSuccess }: HotelOnboardingDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
    phone: "",
    email: "",
    website: "",
    owner_email: "",
    owner_name: "",
    subscription_plan: "free" as "free" | "starter" | "pro" | "enterprise",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // First, create or get the hotel owner user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.owner_email,
        password: Math.random().toString(36).slice(-8), // Temporary password
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (authError && authError.message !== "User already registered") {
        setError(authError.message)
        return
      }

      let ownerId = authData?.user?.id

      // If user already exists, get their ID
      if (!ownerId) {
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("email", formData.owner_email)
          .single()

        ownerId = existingUser?.id
      }

      if (!ownerId) {
        setError("Failed to create or find hotel owner")
        return
      }

      // Create user profile if it doesn't exist
      await supabase.from("users").upsert({
        id: ownerId,
        email: formData.owner_email,
        full_name: formData.owner_name,
        role: "hotel_owner",
      })

      // Create hotel
      const { error: hotelError } = await supabase.from("hotels").insert({
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postal_code: formData.postal_code,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        owner_id: ownerId,
        subscription_plan: formData.subscription_plan,
        subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      })

      if (hotelError) {
        setError(hotelError.message)
        return
      }

      // Reset form and close dialog
      setFormData({
        name: "",
        slug: "",
        description: "",
        address: "",
        city: "",
        state: "",
        country: "",
        postal_code: "",
        phone: "",
        email: "",
        website: "",
        owner_email: "",
        owner_name: "",
        subscription_plan: "free",
      })
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Onboard New Hotel</DialogTitle>
          <DialogDescription>Add a new hotel to the platform and assign a subscription plan</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Hotel Owner Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Hotel Owner Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="owner_name">Owner Name</Label>
                <Input
                  id="owner_name"
                  required
                  value={formData.owner_name}
                  onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner_email">Owner Email</Label>
                <Input
                  id="owner_email"
                  type="email"
                  required
                  value={formData.owner_email}
                  onChange={(e) => setFormData({ ...formData, owner_email: e.target.value })}
                  placeholder="owner@hotel.com"
                />
              </div>
            </div>
          </div>

          {/* Hotel Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Hotel Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Hotel Name</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value
                    setFormData({
                      ...formData,
                      name,
                      slug: formData.slug || generateSlug(name),
                    })
                  }}
                  placeholder="Grand Hotel"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="grand-hotel"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Luxury hotel in the heart of the city..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Hotel Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="info@grandhotel.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="New York"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="NY"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  placeholder="10001"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="United States"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://grandhotel.com"
                />
              </div>
            </div>
          </div>

          {/* Subscription Plan */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Subscription Plan</h3>
            <div className="space-y-2">
              <Label htmlFor="subscription_plan">Plan</Label>
              <Select
                value={formData.subscription_plan}
                onValueChange={(value: "free" | "starter" | "pro" | "enterprise") =>
                  setFormData({ ...formData, subscription_plan: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free - $0/month</SelectItem>
                  <SelectItem value="starter">Starter - $29/month</SelectItem>
                  <SelectItem value="pro">Pro - $99/month</SelectItem>
                  <SelectItem value="enterprise">Enterprise - Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Hotel"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
