"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, MapPin, Calendar, Users } from "lucide-react"
import { useRouter } from "next/navigation"

interface HotelSearchProps {
  initialValues?: {
    city?: string
    checkin?: string
    checkout?: string
    guests?: string
  }
}

export default function HotelSearch({ initialValues = {} }: HotelSearchProps) {
  const router = useRouter()
  const [searchData, setSearchData] = useState({
    city: initialValues.city || "",
    checkin: initialValues.checkin || "",
    checkout: initialValues.checkout || "",
    guests: initialValues.guests || "2",
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams()
    if (searchData.city) params.set("city", searchData.city)
    if (searchData.checkin) params.set("checkin", searchData.checkin)
    if (searchData.checkout) params.set("checkout", searchData.checkout)
    if (searchData.guests) params.set("guests", searchData.guests)

    router.push(`/hotels?${params.toString()}`)
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardContent className="p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="flex items-center text-sm font-medium">
                <MapPin className="h-4 w-4 mr-1" />
                Destination
              </Label>
              <Input
                id="city"
                placeholder="City or hotel name"
                value={searchData.city}
                onChange={(e) => setSearchData({ ...searchData, city: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkin" className="flex items-center text-sm font-medium">
                <Calendar className="h-4 w-4 mr-1" />
                Check-in
              </Label>
              <Input
                id="checkin"
                type="date"
                value={searchData.checkin}
                onChange={(e) => setSearchData({ ...searchData, checkin: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkout" className="flex items-center text-sm font-medium">
                <Calendar className="h-4 w-4 mr-1" />
                Check-out
              </Label>
              <Input
                id="checkout"
                type="date"
                value={searchData.checkout}
                onChange={(e) => setSearchData({ ...searchData, checkout: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guests" className="flex items-center text-sm font-medium">
                <Users className="h-4 w-4 mr-1" />
                Guests
              </Label>
              <Input
                id="guests"
                type="number"
                min="1"
                max="10"
                value={searchData.guests}
                onChange={(e) => setSearchData({ ...searchData, guests: e.target.value })}
              />
            </div>
          </div>

          <Button type="submit" className="w-full md:w-auto">
            <Search className="h-4 w-4 mr-2" />
            Search Hotels
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
