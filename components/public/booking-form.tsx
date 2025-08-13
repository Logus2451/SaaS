"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/lib/supabase/client"
import { ChevronLeft, User, Calendar, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Hotel {
  id: string
  name: string
  slug: string
  city: string | null
  state: string | null
}

interface Room {
  id: string
  room_number: string
  status: string
}

interface RoomType {
  id: string
  name: string
  description: string | null
  base_price: number
  max_occupancy: number
  amenities: string[]
  rooms: Room[]
}

interface BookingFormProps {
  hotel: Hotel
  roomType: RoomType | null
  searchParams: {
    room_type?: string
    checkin?: string
    checkout?: string
    guests?: string
  }
}

export default function BookingForm({ hotel, roomType, searchParams }: BookingFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [bookingReference, setBookingReference] = useState("")

  const [formData, setFormData] = useState({
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    special_requests: "",
    checkin: searchParams.checkin || "",
    checkout: searchParams.checkout || "",
    guests: searchParams.guests || "2",
  })

  const calculateNights = () => {
    if (!formData.checkin || !formData.checkout) return 0
    const checkin = new Date(formData.checkin)
    const checkout = new Date(formData.checkout)
    const diffTime = checkout.getTime() - checkin.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const calculateTotal = () => {
    if (!roomType) return 0
    const nights = calculateNights()
    return nights * roomType.base_price
  }

  const generateBookingReference = () => {
    return "BK" + Date.now().toString().slice(-8)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (!roomType) {
        setError("Room type not found")
        return
      }

      const availableRoom = roomType.rooms.find((room) => room.status === "available")
      if (!availableRoom) {
        setError("No available rooms of this type")
        return
      }

      const totalAmount = calculateTotal()
      if (totalAmount <= 0) {
        setError("Please select valid dates")
        return
      }

      const reference = generateBookingReference()

      const bookingData = {
        hotel_id: hotel.id,
        room_id: availableRoom.id,
        guest_name: formData.guest_name,
        guest_email: formData.guest_email,
        guest_phone: formData.guest_phone || null,
        check_in_date: formData.checkin,
        check_out_date: formData.checkout,
        adults: Number.parseInt(formData.guests),
        children: 0,
        total_amount: totalAmount,
        status: "pending",
        special_requests: formData.special_requests || null,
        booking_reference: reference,
      }

      const { error } = await supabase.from("bookings").insert(bookingData)

      if (error) {
        setError(error.message)
        return
      }

      setBookingReference(reference)
      setSuccess(true)
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const nights = calculateNights()
  const total = calculateTotal()

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-4">Your booking has been successfully submitted.</p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="font-medium">Booking Reference</p>
              <p className="text-2xl font-bold text-blue-600">{bookingReference}</p>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              You will receive a confirmation email shortly with your booking details.
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href={`/booking/${bookingReference}`}>View Booking Details</Link>
              </Button>
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/hotels">Browse More Hotels</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!roomType) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Room not found</h2>
            <p className="text-gray-600 mb-4">The selected room type is not available.</p>
            <Button asChild>
              <Link href={`/hotels/${hotel.slug}`}>Back to Hotel</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Button variant="ghost" asChild className="mr-4">
              <Link href={`/hotels/${hotel.slug}`}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Hotel
              </Link>
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Complete Your Booking</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Guest Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Guest Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="guest_name">Full Name</Label>
                      <Input
                        id="guest_name"
                        required
                        value={formData.guest_name}
                        onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guest_email">Email</Label>
                      <Input
                        id="guest_email"
                        type="email"
                        required
                        value={formData.guest_email}
                        onChange={(e) => setFormData({ ...formData, guest_email: e.target.value })}
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guest_phone">Phone Number</Label>
                    <Input
                      id="guest_phone"
                      value={formData.guest_phone}
                      onChange={(e) => setFormData({ ...formData, guest_phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Booking Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Booking Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="checkin">Check-in Date</Label>
                      <Input
                        id="checkin"
                        type="date"
                        required
                        value={formData.checkin}
                        onChange={(e) => setFormData({ ...formData, checkin: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkout">Check-out Date</Label>
                      <Input
                        id="checkout"
                        type="date"
                        required
                        value={formData.checkout}
                        onChange={(e) => setFormData({ ...formData, checkout: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guests">Number of Guests</Label>
                    <Input
                      id="guests"
                      type="number"
                      min="1"
                      max={roomType.max_occupancy}
                      required
                      value={formData.guests}
                      onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="special_requests">Special Requests (Optional)</Label>
                    <Textarea
                      id="special_requests"
                      value={formData.special_requests}
                      onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                      placeholder="Any special requests or preferences"
                    />
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" className="w-full" disabled={loading || nights === 0}>
                {loading ? "Processing..." : "Complete Booking"}
              </Button>
            </form>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">{hotel.name}</h3>
                  <p className="text-sm text-gray-600">
                    {hotel.city}, {hotel.state}
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium">{roomType.name}</h4>
                  <p className="text-sm text-gray-600">{roomType.description}</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Check-in:</span>
                    <span>{formData.checkin ? new Date(formData.checkin).toLocaleDateString() : "Not selected"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Check-out:</span>
                    <span>{formData.checkout ? new Date(formData.checkout).toLocaleDateString() : "Not selected"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Guests:</span>
                    <span>{formData.guests}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Nights:</span>
                    <span>{nights}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Room rate:</span>
                    <span>${roomType.base_price}/night</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{nights} nights:</span>
                    <span>${roomType.base_price * nights}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${total}</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  <p>• Free cancellation up to 24 hours before check-in</p>
                  <p>• No booking fees</p>
                  <p>• Confirmation email will be sent</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
