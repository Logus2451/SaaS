import { createClient } from "@/lib/supabase/server"
import HotelSearch from "@/components/public/hotel-search"
import HotelCard from "@/components/public/hotel-card"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Building2 } from "lucide-react"

interface Hotel {
  id: string
  name: string
  slug: string
  description: string | null
  city: string | null
  state: string | null
  country: string | null
  subscription_plan: string
  is_active: boolean
}

export default async function HotelsPage({
  searchParams,
}: {
  searchParams: { city?: string; checkin?: string; checkout?: string; guests?: string }
}) {
  const supabase = createClient()

  // Get active hotels
  let query = supabase
    .from("hotels")
    .select("id, name, slug, description, city, state, country, subscription_plan, is_active")
    .eq("is_active", true)
    .order("name")

  // Filter by city if provided
  if (searchParams.city) {
    query = query.ilike("city", `%${searchParams.city}%`)
  }

  const { data: hotels } = await query

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">HotelSaaS</h1>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" asChild>
                <a href="/auth/login">Sign In</a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Your Perfect Stay</h1>
          <p className="text-xl text-gray-600 mb-8">Discover amazing hotels and book your next adventure</p>

          {/* Search Component */}
          <HotelSearch initialValues={searchParams} />
        </div>

        {/* Results */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {searchParams.city ? `Hotels in ${searchParams.city}` : "All Hotels"}
            </h2>
            <p className="text-gray-600">{hotels?.length || 0} hotels found</p>
          </div>

          {hotels && hotels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} searchParams={searchParams} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hotels found</h3>
                <p className="text-gray-600">Try adjusting your search criteria</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
