"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Bed, Wifi, Tv, Coffee, Car } from "lucide-react"

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
  images: string[]
  rooms: Room[]
}

interface Hotel {
  id: string
  name: string
  slug: string
}

interface RoomTypeCardProps {
  roomType: RoomType
  hotel: Hotel
  searchParams: { checkin?: string; checkout?: string; guests?: string }
  onSelect: () => void
}

export default function RoomTypeCard({ roomType, hotel, searchParams, onSelect }: RoomTypeCardProps) {
  const availableRooms = roomType.rooms.filter((room) => room.status === "available").length

  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase()
    if (amenityLower.includes("wifi")) return <Wifi className="h-4 w-4" />
    if (amenityLower.includes("tv")) return <Tv className="h-4 w-4" />
    if (amenityLower.includes("coffee")) return <Coffee className="h-4 w-4" />
    if (amenityLower.includes("parking")) return <Car className="h-4 w-4" />
    return <Bed className="h-4 w-4" />
  }

  const buildBookingUrl = () => {
    const params = new URLSearchParams()
    params.set("room_type", roomType.id)
    if (searchParams.checkin) params.set("checkin", searchParams.checkin)
    if (searchParams.checkout) params.set("checkout", searchParams.checkout)
    if (searchParams.guests) params.set("guests", searchParams.guests)

    return `/hotels/${hotel.slug}/book?${params.toString()}`
  }

  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
        {/* Room Image */}
        <div className="aspect-video md:aspect-square">
          <img
            src={`/abstract-geometric-shapes.png?height=200&width=300&query=${roomType.name} hotel room`}
            alt={roomType.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Room Details */}
        <div className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{roomType.name}</CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <Users className="h-4 w-4 mr-1" />
                  Up to {roomType.max_occupancy} guests
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                {availableRooms} available
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            <p className="text-gray-600 mb-4">
              {roomType.description || "Comfortable and well-appointed room with modern amenities."}
            </p>

            {/* Amenities */}
            {roomType.amenities.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Room Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {roomType.amenities.slice(0, 6).map((amenity, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {getAmenityIcon(amenity)}
                      <span className="ml-1">{amenity}</span>
                    </div>
                  ))}
                  {roomType.amenities.length > 6 && (
                    <div className="text-sm text-gray-500 px-2 py-1">+{roomType.amenities.length - 6} more</div>
                  )}
                </div>
              </div>
            )}

            {/* Pricing and Booking */}
            <div className="flex justify-between items-center">
              <div>
                <span className="text-3xl font-bold text-green-600">${roomType.base_price}</span>
                <span className="text-gray-500">/night</span>
              </div>
              <Button asChild onClick={onSelect}>
                <a href={buildBookingUrl()}>Book Now</a>
              </Button>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  )
}
