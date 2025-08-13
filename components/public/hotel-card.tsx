import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, Wifi, Car, Coffee } from "lucide-react"
import Link from "next/link"

interface Hotel {
  id: string
  name: string
  slug: string
  description: string | null
  city: string | null
  state: string | null
  country: string | null
  subscription_plan: string
}

interface HotelCardProps {
  hotel: Hotel
  searchParams?: {
    city?: string
    checkin?: string
    checkout?: string
    guests?: string
  }
}

export default function HotelCard({ hotel, searchParams }: HotelCardProps) {
  const buildHotelUrl = () => {
    const baseUrl = `/hotels/${hotel.slug}`
    if (!searchParams?.checkin || !searchParams?.checkout) {
      return baseUrl
    }

    const params = new URLSearchParams()
    if (searchParams.checkin) params.set("checkin", searchParams.checkin)
    if (searchParams.checkout) params.set("checkout", searchParams.checkout)
    if (searchParams.guests) params.set("guests", searchParams.guests)

    return `${baseUrl}?${params.toString()}`
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-gradient-to-r from-blue-500 to-purple-600 relative">
        <img
          src={`/grand-hotel.png?height=200&width=300&query=hotel ${hotel.name}`}
          alt={hotel.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4">
          <Badge className="bg-white text-gray-900">
            {hotel.subscription_plan.charAt(0).toUpperCase() + hotel.subscription_plan.slice(1)}
          </Badge>
        </div>
      </div>

      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{hotel.name}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              {hotel.city}, {hotel.state}
            </CardDescription>
          </div>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="ml-1 text-sm font-medium">4.5</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {hotel.description || "Experience comfort and luxury at this beautiful hotel."}
        </p>

        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
          <div className="flex items-center">
            <Wifi className="h-4 w-4 mr-1" />
            Free WiFi
          </div>
          <div className="flex items-center">
            <Car className="h-4 w-4 mr-1" />
            Parking
          </div>
          <div className="flex items-center">
            <Coffee className="h-4 w-4 mr-1" />
            Restaurant
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <span className="text-2xl font-bold text-green-600">$99</span>
            <span className="text-gray-500 text-sm">/night</span>
          </div>
          <Button asChild>
            <Link href={buildHotelUrl()}>View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
