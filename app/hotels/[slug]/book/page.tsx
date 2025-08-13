import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import BookingForm from "@/components/public/booking-form"

interface BookingPageProps {
  params: { slug: string }
  searchParams: {
    room_type?: string
    checkin?: string
    checkout?: string
    guests?: string
  }
}

export default async function BookingPage({ params, searchParams }: BookingPageProps) {
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

  // Get room type details if specified
  let roomType = null
  if (searchParams.room_type) {
    const { data } = await supabase
      .from("room_types")
      .select(`
        id,
        name,
        description,
        base_price,
        max_occupancy,
        amenities,
        rooms (
          id,
          room_number,
          status
        )
      `)
      .eq("id", searchParams.room_type)
      .eq("hotel_id", hotel.id)
      .single()

    roomType = data
  }

  return <BookingForm hotel={hotel} roomType={roomType} searchParams={searchParams} />
}
