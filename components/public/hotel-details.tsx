"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MapPin, Star, Wifi, Car, Coffee, Users, Bed, Phone, Mail, Globe, ChevronLeft } from "lucide-react"
import Link from "next/link"
import RoomTypeCard from "./room-type-card"
import BookingWidget from "./booking-widget"

interface Hotel {
  id: string
  name: string
  slug: string
  description: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  phone: string | null
  email: string | null
  website: string | null
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
  images: string[]
  rooms: Room[]
}

interface HotelDetailsProps {
  hotel: Hotel
  roomTypes: RoomType[]
  searchParams: { checkin?: string; checkout?: string; guests?: string }
}

export default function HotelDetails({ hotel, roomTypes, searchParams }: HotelDetailsProps) {
  const [selectedRoomType, setSelectedRoomType] = useState<string | null>(null)

  const availableRoomTypes = roomTypes.filter((rt) => rt.rooms.some((room) => room.status === "available"))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Button variant="ghost" asChild className="mr-4">
              <Link href="/hotels">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Hotels
              </Link>
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">{hotel.name}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hotel Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="aspect-video rounded-lg overflow-hidden">
              <img
                src={`/luxury-hotel.png?height=400&width=800&query=luxury hotel ${hotel.name}`}
                alt={hotel.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Hotel Info */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-3xl">{hotel.name}</CardTitle>
                    <CardDescription className="flex items-center mt-2 text-lg">
                      <MapPin className="h-5 w-5 mr-2" />
                      {hotel.address && `${hotel.address}, `}
                      {hotel.city}, {hotel.state}, {hotel.country}
                    </CardDescription>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="ml-1 text-lg font-medium">4.5</span>
                    <span className="ml-1 text-gray-500">(124 reviews)</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-6">
                  {hotel.description ||
                    "Experience luxury and comfort at this beautiful hotel with world-class amenities and exceptional service."}
                </p>

                {/* Amenities */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Hotel Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center">
                      <Wifi className="h-5 w-5 mr-2 text-blue-600" />
                      <span>Free WiFi</span>
                    </div>
                    <div className="flex items-center">
                      <Car className="h-5 w-5 mr-2 text-blue-600" />
                      <span>Free Parking</span>
                    </div>
                    <div className="flex items-center">
                      <Coffee className="h-5 w-5 mr-2 text-blue-600" />
                      <span>Restaurant</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-blue-600" />
                      <span>Concierge</span>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <Separator className="my-6" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {hotel.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{hotel.phone}</span>
                    </div>
                  )}
                  {hotel.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{hotel.email}</span>
                    </div>
                  )}
                  {hotel.website && (
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-gray-500" />
                      <a
                        href={hotel.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Room Types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bed className="h-5 w-5 mr-2" />
                  Available Rooms
                </CardTitle>
                <CardDescription>Choose from our selection of comfortable rooms</CardDescription>
              </CardHeader>
              <CardContent>
                {availableRoomTypes.length > 0 ? (
                  <div className="space-y-6">
                    {availableRoomTypes.map((roomType) => (
                      <RoomTypeCard
                        key={roomType.id}
                        roomType={roomType}
                        hotel={hotel}
                        searchParams={searchParams}
                        onSelect={() => setSelectedRoomType(roomType.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms available</h3>
                    <p className="text-gray-600">Please try different dates or contact the hotel directly</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <BookingWidget hotel={hotel} roomTypes={availableRoomTypes} searchParams={searchParams} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
