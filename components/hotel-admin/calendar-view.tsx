"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase/client"
import { ChevronLeft, ChevronRight, Calendar, Filter, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface Room {
  id: string
  room_number: string
  room_type_id: string
  status: string
}

interface RoomType {
  id: string
  name: string
  rooms: Room[]
}

interface Booking {
  id: string
  room_id: string
  guest_name: string
  check_in_date: string
  check_out_date: string
  status: string
  booking_reference: string
}

interface CalendarViewProps {
  hotelId: string
}

export default function CalendarView({ hotelId }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRoomType, setSelectedRoomType] = useState("all")
  const [collapsedRoomTypes, setCollapsedRoomTypes] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadCalendarData()
  }, [hotelId, currentDate])

  const loadCalendarData = async () => {
    try {
      // Load room types and rooms
      const { data: roomTypesData } = await supabase
        .from("room_types")
        .select(`
          id,
          name,
          rooms (
            id,
            room_number,
            room_type_id,
            status
          )
        `)
        .eq("hotel_id", hotelId)
        .eq("is_active", true)
        .order("name")

      // Load bookings for the current month
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      const { data: bookingsData } = await supabase
        .from("bookings")
        .select("*")
        .eq("hotel_id", hotelId)
        .gte("check_in_date", startOfMonth.toISOString().split("T")[0])
        .lte("check_out_date", endOfMonth.toISOString().split("T")[0])
        .neq("status", "cancelled")

      setRoomTypes(roomTypesData || [])
      setBookings(bookingsData || [])
    } catch (error) {
      console.error("Error loading calendar data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []

    for (let date = new Date(firstDay); date <= lastDay; date.setDate(date.getDate() + 1)) {
      days.push(new Date(date))
    }

    return days
  }

  const getBookingForRoomAndDate = (roomId: string, date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return bookings.find(
      (booking) => booking.room_id === roomId && booking.check_in_date <= dateStr && booking.check_out_date > dateStr,
    )
  }

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-500 text-white"
      case "checked_in":
        return "bg-green-500 text-white"
      case "pending":
        return "bg-yellow-500 text-black"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getRoomAvailabilityForDate = (roomTypeId: string, date: Date) => {
    const roomType = roomTypes.find((rt) => rt.id === roomTypeId)
    if (!roomType) return { total: 0, available: 0, occupied: 0 }

    const total = roomType.rooms.length
    const occupied = roomType.rooms.filter((room) => getBookingForRoomAndDate(room.id, date)).length
    const available = total - occupied

    return { total, available, occupied }
  }

  const toggleRoomTypeCollapse = (roomTypeId: string) => {
    const newCollapsed = new Set(collapsedRoomTypes)
    if (newCollapsed.has(roomTypeId)) {
      newCollapsed.delete(roomTypeId)
    } else {
      newCollapsed.add(roomTypeId)
    }
    setCollapsedRoomTypes(newCollapsed)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const days = getDaysInMonth()
  const filteredRoomTypes =
    selectedRoomType === "all" ? roomTypes : roomTypes.filter((rt) => rt.id === selectedRoomType)

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading calendar...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Room Calendar
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-medium min-w-[120px] text-center">
                  {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
                <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by room type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Room Types</SelectItem>
                  {roomTypes.map((roomType) => (
                    <SelectItem key={roomType.id} value={roomType.id}>
                      {roomType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[1200px]">
              {/* Date Headers */}
              <div className="flex border-b bg-gray-50">
                <div className="w-48 p-3 font-medium border-r">Room</div>
                {days.map((day) => (
                  <div key={day.toISOString()} className="flex-1 min-w-[80px] p-2 text-center border-r">
                    <div className="text-xs text-gray-500">{day.toLocaleDateString("en-US", { weekday: "short" })}</div>
                    <div className="font-medium">{day.getDate()}</div>
                  </div>
                ))}
              </div>

              {/* Room Rows */}
              {filteredRoomTypes.map((roomType) => (
                <div key={roomType.id}>
                  {/* Room Type Header */}
                  <div className="flex border-b bg-blue-50">
                    <div className="w-48 p-3 border-r">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-blue-900">{roomType.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRoomTypeCollapse(roomType.id)}
                          className="h-6 w-6 p-0"
                        >
                          {collapsedRoomTypes.has(roomType.id) ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    {days.map((day) => {
                      const availability = getRoomAvailabilityForDate(roomType.id, day)
                      const occupancyRate =
                        availability.total > 0 ? (availability.occupied / availability.total) * 100 : 0
                      return (
                        <div key={day.toISOString()} className="flex-1 min-w-[80px] p-2 text-center border-r">
                          <div className="text-xs">
                            <div className="text-green-600 font-medium">{availability.available}</div>
                            <div className="text-red-600">{availability.occupied}</div>
                            <div className="text-gray-500">{occupancyRate.toFixed(0)}%</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Individual Room Rows */}
                  {!collapsedRoomTypes.has(roomType.id) &&
                    roomType.rooms.map((room) => (
                      <div key={room.id} className="flex border-b hover:bg-gray-50">
                        <div className="w-48 p-3 border-r">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">#{room.room_number}</span>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                room.status === "available" && "bg-green-100 text-green-800",
                                room.status === "maintenance" && "bg-yellow-100 text-yellow-800",
                                room.status === "blocked" && "bg-red-100 text-red-800",
                              )}
                            >
                              {room.status}
                            </Badge>
                          </div>
                        </div>
                        {days.map((day) => {
                          const booking = getBookingForRoomAndDate(room.id, day)
                          return (
                            <div key={day.toISOString()} className="flex-1 min-w-[80px] p-1 border-r">
                              {booking ? (
                                <div
                                  className={cn(
                                    "text-xs p-1 rounded text-center cursor-pointer hover:opacity-80",
                                    getBookingStatusColor(booking.status),
                                  )}
                                  title={`${booking.guest_name} - ${booking.booking_reference}`}
                                >
                                  <div className="truncate font-medium">{booking.guest_name}</div>
                                  <div className="text-xs opacity-90">{booking.booking_reference}</div>
                                </div>
                              ) : (
                                <div className="h-12 flex items-center justify-center">
                                  {room.status === "available" ? (
                                    <div className="w-2 h-2 bg-green-200 rounded-full"></div>
                                  ) : (
                                    <div className="text-xs text-gray-400">N/A</div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ))}
                </div>
              ))}

              {/* Summary Row */}
              <div className="flex border-t-2 bg-gray-100 font-medium">
                <div className="w-48 p-3 border-r">Room Availability</div>
                {days.map((day) => {
                  const totalRooms = filteredRoomTypes.reduce((sum, rt) => sum + rt.rooms.length, 0)
                  const occupiedRooms = filteredRoomTypes.reduce((sum, rt) => {
                    return sum + rt.rooms.filter((room) => getBookingForRoomAndDate(room.id, day)).length
                  }, 0)
                  const availableRooms = totalRooms - occupiedRooms
                  const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0

                  return (
                    <div key={day.toISOString()} className="flex-1 min-w-[80px] p-2 text-center border-r">
                      <div className="text-sm">
                        <div className="text-green-600 font-bold">{availableRooms}</div>
                        <div className="text-red-600">{occupiedRooms}</div>
                        <div className="text-blue-600">{occupancyRate.toFixed(0)}%</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Confirmed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Checked In</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>Pending</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-200 rounded-full"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400">N/A</span>
              <span>Not Available</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
