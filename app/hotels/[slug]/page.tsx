import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import HotelDetails from "@/components/public/hotel-details"

interface HotelPageProps {
  params: { slug: string }
  searchParams: { checkin?: string; checkout?: string; guests?: string }
}

export default async function HotelPage({ params, searchParams }: HotelPageProps) {
  const supabase = createClient()

  // Get hotel details
  const { data: hotel } = await supabase
    .from("hotels")
    .select("*")
    .eq("slug", params.slug)
    .eq("is_active", true)
    .single()

  if (!hotel) {
    notFound()
  }

  // Get room types for this hotel
  const { data: roomTypes } = await supabase
    .from("room_types")
    .select(`
      id,
      name,
      description,
      base_price,
      max_occupancy,
      amenities,
      images,
      rooms (
        id,
        room_number,
        status
      )
    `)
    .eq("hotel_id", hotel.id)
    .eq("is_active", true)
    .order("base_price")

  return <HotelDetails hotel={hotel} roomTypes={roomTypes || []} searchParams={searchParams} />
}
