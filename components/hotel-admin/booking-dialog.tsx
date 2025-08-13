"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase/client"
import { Calendar, User } from "lucide-react"

interface Room {
  id: string
  room_number: string
  room_type: {
    name: string
    base_price: number
  }
}

interface BookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hotelId: string
  selectedDate?: Date
  selectedRoomId?: string
  onSuccess: () => void
}

export default function BookingDialog({
  open,
  onOpenChange,
  hotelId,
  selectedDate,
  selectedRoomId,
  onSuccess,
}: BookingDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [rooms, setRooms] = useState<Room[]>([])
  const [formData, setFormData] = useState({
    room_id: selectedRoomId || "",
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    check_in_date: selectedDate ? selectedDate.toISOString().split("T")[0] : "",
    check_out_date: "",
    adults: "1",
    children: "0",
    special_requests: "",
  })

  useEffect(() => {
    if (open) {
      loadAvailableRooms()
    }
  }, [open, hotelId])

  useEffect(() => {
    if (selectedRoomId) {
      setFormData((prev) => ({ ...prev, room_id: selectedRoomId }))
    }
    if (selectedDate) {
      setFormData((prev) => ({ ...prev, check_in_date: selectedDate.toISOString().split("T")[0] }))
    }
  }, [selectedRoomId, selectedDate])

  const loadAvailableRooms = async () => {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select(`
          id,
          room_number,
          room_types (
            name,
            base_price
          )
        `)
        .eq("hotel_id", hotelId)
        .eq("status", "available")

      if (error) {
        console.error("Error loading rooms:", error)
        return
      }

      const formattedRooms =
        data?.map((room) => ({
          ...room,
          room_type: room.room_types as any,
        })) || []

      setRooms(formattedRooms)
    } catch (error) {
      console.error("Error loading rooms:", error)
    }
  }

  const calculateTotal = () => {
    const selectedRoom = rooms.find((room) => room.id === formData.room_id)
    if (!selectedRoom || !formData.check_in_date || !formData.check_out_date) return 0

    const checkIn = new Date(formData.check_in_date)
    const checkOut = new Date(formData.check_out_date)
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

    return nights > 0 ? nights * selectedRoom.room_type.base_price : 0
  }

  const generateBookingReference = () => {
    return "BK" + Date.now().toString().slice(-8)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const totalAmount = calculateTotal()
      if (totalAmount <= 0) {
        setError("Please select valid dates")
        return
      }

      const bookingData = {
        hotel_id: hotelId,
        room_id: formData.room_id,
        guest_name: formData.guest_name,
        guest_email: formData.guest_email,
        guest_phone: formData.guest_phone || null,
        check_in_date: formData.check_in_date,
        check_out_date: formData.check_out_date,
        adults: Number.parseInt(formData.adults),
        children: Number.parseInt(formData.children),
        total_amount: totalAmount,
        status: "confirmed",
        special_requests: formData.special_requests || null,
        booking_reference: generateBookingReference(),
      }

      const { error } = await supabase.from("bookings").insert(bookingData)

      if (error) {
        setError(error.message)
        return
      }

      // Reset form and close dialog
      setFormData({
        room_id: "",
        guest_name: "",
        guest_email: "",
        guest_phone: "",
        check_in_date: "",
        check_out_date: "",
        adults: "1",
        children: "0",
        special_requests: "",
      })
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const totalAmount = calculateTotal()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Create New Booking
          </DialogTitle>
          <DialogDescription>Add a new booking for your hotel</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Guest Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center">
              <User className="h-5 w-5 mr-2" />
              Guest Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guest_name">Guest Name</Label>
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
              <Label htmlFor="guest_phone">Phone (optional)</Label>
              <Input
                id="guest_phone"
                value={formData.guest_phone}
                onChange={(e) => setFormData({ ...formData, guest_phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          {/* Booking Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Booking Details</h3>
            <div className="space-y-2">
              <Label htmlFor="room_id">Room</Label>
              <Select value={formData.room_id} onValueChange={(value) => setFormData({ ...formData, room_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      Room {room.room_number} - {room.room_type.name} (${room.room_type.base_price}/night)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="check_in_date">Check-in Date</Label>
                <Input
                  id="check_in_date"
                  type="date"
                  required
                  value={formData.check_in_date}
                  onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="check_out_date">Check-out Date</Label>
                <Input
                  id="check_out_date"
                  type="date"
                  required
                  value={formData.check_out_date}
                  onChange={(e) => setFormData({ ...formData, check_out_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adults">Adults</Label>
                <Select value={formData.adults} onValueChange={(value) => setFormData({ ...formData, adults: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="children">Children</Label>
                <Select
                  value={formData.children}
                  onValueChange={(value) => setFormData({ ...formData, children: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="special_requests">Special Requests (optional)</Label>
              <Textarea
                id="special_requests"
                value={formData.special_requests}
                onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                placeholder="Any special requests or notes"
              />
            </div>
          </div>

          {/* Booking Summary */}
          {totalAmount > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Booking Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-medium">${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || totalAmount <= 0}>
              {loading ? "Creating..." : "Create Booking"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
