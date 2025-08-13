"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/lib/supabase/client"
import { Search, Calendar, User, Phone, Mail } from "lucide-react"

interface Booking {
  id: string
  booking_reference: string
  guest_name: string
  guest_email: string
  guest_phone: string | null
  check_in_date: string
  check_out_date: string
  adults: number
  children: number
  total_amount: number
  status: "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled"
  special_requests: string | null
  created_at: string
  room: {
    room_number: string
    room_type: {
      name: string
    }
  }
}

interface BookingsOverviewProps {
  hotelId: string
  limit?: number
}

export default function BookingsOverview({ hotelId, limit }: BookingsOverviewProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    loadBookings()
  }, [hotelId])

  const loadBookings = async () => {
    try {
      let query = supabase
        .from("bookings")
        .select(`
          id,
          booking_reference,
          guest_name,
          guest_email,
          guest_phone,
          check_in_date,
          check_out_date,
          adults,
          children,
          total_amount,
          status,
          special_requests,
          created_at,
          rooms (
            room_number,
            room_types (
              name
            )
          )
        `)
        .eq("hotel_id", hotelId)
        .order("created_at", { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error loading bookings:", error)
        return
      }

      const formattedBookings =
        data?.map((booking) => ({
          ...booking,
          room: {
            room_number: booking.rooms?.room_number || "N/A",
            room_type: {
              name: booking.rooms?.room_types?.name || "N/A",
            },
          },
        })) || []

      setBookings(formattedBookings)
    } catch (error) {
      console.error("Error loading bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("bookings").update({ status: newStatus }).eq("id", bookingId)

      if (error) {
        console.error("Error updating booking status:", error)
        return
      }

      await loadBookings()
    } catch (error) {
      console.error("Error updating booking status:", error)
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.booking_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guest_email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || booking.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "checked_in":
        return "bg-green-100 text-green-800"
      case "checked_out":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading bookings...</div>
        </CardContent>
      </Card>
    )
  }

  if (limit && bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No recent bookings</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {!limit && (
        <Card>
          <CardHeader>
            <CardTitle>Bookings Management</CardTitle>
            <CardDescription>View and manage all bookings for your hotel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="checked_in">Checked In</SelectItem>
                  <SelectItem value="checked_out">Checked Out</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                {!limit && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.booking_reference}</TableCell>
                  <TableCell>
                    <div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {booking.guest_name}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="h-3 w-3 mr-1" />
                        {booking.guest_email}
                      </div>
                      {booking.guest_phone && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="h-3 w-3 mr-1" />
                          {booking.guest_phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">Room {booking.room.room_number}</div>
                      <div className="text-sm text-muted-foreground">{booking.room.room_type.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <div>
                        <div className="text-sm">{new Date(booking.check_in_date).toLocaleDateString()} -</div>
                        <div className="text-sm">{new Date(booking.check_out_date).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">${booking.total_amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace("_", " ")}
                    </Badge>
                  </TableCell>
                  {!limit && (
                    <TableCell>
                      <div className="flex space-x-2">
                        {booking.status === "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateBookingStatus(booking.id, "confirmed")}
                          >
                            Confirm
                          </Button>
                        )}
                        {booking.status === "confirmed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateBookingStatus(booking.id, "checked_in")}
                          >
                            Check In
                          </Button>
                        )}
                        {booking.status === "checked_in" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateBookingStatus(booking.id, "checked_out")}
                          >
                            Check Out
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No bookings found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
