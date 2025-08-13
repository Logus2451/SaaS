"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Users, DollarSign } from "lucide-react"
import { useRouter } from "next/navigation"

interface Hotel {
  id: string
  name: string
  slug: string
}

interface Room {
  id: string
  room_number: string
  status: string
}

interface RoomType {
  id: string
  name: string
  base_price: number
  max_occupancy: number
  rooms: Room[]
}

interface BookingWidgetProps {
  hotel: Hotel
  roomTypes: RoomType[]
  searchParams: { checkin?: string; checkout?: string; guests?: string }
}

export default function BookingWidget({ hotel, roomTypes, searchParams }: BookingWidgetProps) {
  const router = useRouter()
  const [bookingData, setBookingData] = useState({
    checkin: searchParams.checkin || "",
    checkout: searchParams.checkout || "",
    guests: searchParams.guests || "2",
    roomType: "",
  })

  const calculateNights = () => {
    if (!bookingData.checkin || !bookingData.checkout) return 0
    const checkin = new Date(bookingData.checkin)
    const checkout = new Date(bookingData.checkout)
    const diffTime = checkout.getTime() - checkin.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const calculateTotal = () => {
    const nights = calculateNights()
    const selectedRoomType = roomTypes.find((rt) => rt.id === bookingData.roomType)
    if (!selectedRoomType || nights === 0) return 0
    return nights * selectedRoomType.base_price
  }

  const handleBookNow = () => {
    const params = new URLSearchParams()
    if (bookingData.roomType) params.set("room_type", bookingData.roomType)
    if (bookingData.checkin) params.set("checkin", bookingData.checkin)
    if (bookingData.checkout) params.set("checkout", bookingData.checkout)
    if (bookingData.guests) params.set("guests", bookingData.guests)

    router.push(`/hotels/${hotel.slug}/book?${params.toString()}`)
  }

  const nights = calculateNights()
  const total = calculateTotal()
  const selectedRoomType = roomTypes.find((rt) => rt.id === bookingData.roomType)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Book Your Stay
        </CardTitle>
        <CardDescription>Select your dates and room type</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="checkin">Check-in</Label>
            <Input
              id="checkin"
              type="date"
              value={bookingData.checkin}
              onChange={(e) => setBookingData({ ...bookingData, checkin: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkout">Check-out</Label>
            <Input
              id="checkout"
              type="date"
              value={bookingData.checkout}
              onChange={(e) => setBookingData({ ...bookingData, checkout: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="guests" className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            Guests
          </Label>
          <Select
            value={bookingData.guests}
            onValueChange={(value) => setBookingData({ ...bookingData, guests: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? "Guest" : "Guests"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="roomType">Room Type</Label>
          <Select
            value={bookingData.roomType}
            onValueChange={(value) => setBookingData({ ...bookingData, roomType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select room type" />
            </SelectTrigger>
            <SelectContent>
              {roomTypes.map((roomType) => (
                <SelectItem key={roomType.id} value={roomType.id}>
                  {roomType.name} - ${roomType.base_price}/night
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Booking Summary */}
        {nights > 0 && selectedRoomType && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>{selectedRoomType.name}</span>
              <span>${selectedRoomType.base_price}/night</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>
                {nights} {nights === 1 ? "night" : "nights"}
              </span>
              <span>${selectedRoomType.base_price * nights}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span className="flex items-center">
                <DollarSign className="h-4 w-4" />
                {total}
              </span>
            </div>
          </div>
        )}

        <Button
          className="w-full"
          onClick={handleBookNow}
          disabled={!bookingData.checkin || !bookingData.checkout || !bookingData.roomType || nights === 0}
        >
          Book Now
        </Button>

        <p className="text-xs text-gray-500 text-center">Free cancellation • No booking fees</p>
      </CardContent>
    </Card>
  )
}
