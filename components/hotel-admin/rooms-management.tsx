"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase/client"
import { Plus, Edit, Trash2, Bed } from "lucide-react"

interface Room {
  id: string
  room_number: string
  floor: number | null
  status: "available" | "occupied" | "maintenance" | "blocked"
  notes: string | null
  room_type: {
    id: string
    name: string
    base_price: number
  }
}

interface RoomType {
  id: string
  name: string
  base_price: number
}

interface RoomsManagementProps {
  hotelId: string
  onUpdate: () => void
}

export default function RoomsManagement({ hotelId, onUpdate }: RoomsManagementProps) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    room_number: "",
    room_type_id: "",
    floor: "",
    status: "available" as "available" | "occupied" | "maintenance" | "blocked",
    notes: "",
  })

  useEffect(() => {
    loadRooms()
    loadRoomTypes()
  }, [hotelId])

  const loadRooms = async () => {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select(`
          id,
          room_number,
          floor,
          status,
          notes,
          room_types (
            id,
            name,
            base_price
          )
        `)
        .eq("hotel_id", hotelId)
        .order("room_number")

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
    } finally {
      setLoading(false)
    }
  }

  const loadRoomTypes = async () => {
    try {
      const { data, error } = await supabase
        .from("room_types")
        .select("id, name, base_price")
        .eq("hotel_id", hotelId)
        .eq("is_active", true)

      if (error) {
        console.error("Error loading room types:", error)
        return
      }

      setRoomTypes(data || [])
    } catch (error) {
      console.error("Error loading room types:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const roomData = {
        hotel_id: hotelId,
        room_type_id: formData.room_type_id,
        room_number: formData.room_number,
        floor: formData.floor ? Number.parseInt(formData.floor) : null,
        status: formData.status,
        notes: formData.notes || null,
      }

      if (editingRoom) {
        const { error } = await supabase.from("rooms").update(roomData).eq("id", editingRoom.id)

        if (error) {
          setError(error.message)
          return
        }
      } else {
        const { error } = await supabase.from("rooms").insert(roomData)

        if (error) {
          setError(error.message)
          return
        }
      }

      // Reset form and close dialog
      setFormData({
        room_number: "",
        room_type_id: "",
        floor: "",
        status: "available",
        notes: "",
      })
      setEditingRoom(null)
      setShowDialog(false)
      await loadRooms()
      onUpdate()
    } catch (error) {
      setError("An unexpected error occurred")
    }
  }

  const handleEdit = (room: Room) => {
    setEditingRoom(room)
    setFormData({
      room_number: room.room_number,
      room_type_id: room.room_type.id,
      floor: room.floor?.toString() || "",
      status: room.status,
      notes: room.notes || "",
    })
    setShowDialog(true)
  }

  const handleDelete = async (roomId: string) => {
    if (!confirm("Are you sure you want to delete this room?")) {
      return
    }

    try {
      const { error } = await supabase.from("rooms").delete().eq("id", roomId)

      if (error) {
        console.error("Error deleting room:", error)
        return
      }

      await loadRooms()
      onUpdate()
    } catch (error) {
      console.error("Error deleting room:", error)
    }
  }

  const openNewDialog = () => {
    setEditingRoom(null)
    setFormData({
      room_number: "",
      room_type_id: "",
      floor: "",
      status: "available",
      notes: "",
    })
    setShowDialog(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800"
      case "occupied":
        return "bg-red-100 text-red-800"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800"
      case "blocked":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading rooms...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Rooms</CardTitle>
              <CardDescription>Manage individual rooms in your hotel</CardDescription>
            </div>
            <Button onClick={openNewDialog} disabled={roomTypes.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Add Room
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {roomTypes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">You need to create room types first before adding rooms</p>
              <p className="text-sm text-muted-foreground">Go to the Room Types tab to get started</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No rooms found</p>
              <Button onClick={openNewDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Room
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {rooms.map((room) => (
                <Card key={room.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <Bed className="h-5 w-5 text-blue-600 mr-2" />
                        <CardTitle className="text-lg">Room {room.room_number}</CardTitle>
                      </div>
                      <Badge className={getStatusColor(room.status)}>
                        {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium">{room.room_type.name}</p>
                        <p className="text-sm text-muted-foreground">${room.room_type.base_price}/night</p>
                      </div>

                      {room.floor && <p className="text-sm text-muted-foreground">Floor {room.floor}</p>}

                      {room.notes && (
                        <p className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">{room.notes}</p>
                      )}

                      <div className="flex justify-end space-x-2 pt-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(room)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(room.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRoom ? "Edit Room" : "Add New Room"}</DialogTitle>
            <DialogDescription>
              {editingRoom ? "Update the room details" : "Add a new room to your hotel"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room_number">Room Number</Label>
                <Input
                  id="room_number"
                  required
                  value={formData.room_number}
                  onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                  placeholder="101"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="floor">Floor (optional)</Label>
                <Input
                  id="floor"
                  type="number"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  placeholder="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="room_type_id">Room Type</Label>
              <Select
                value={formData.room_type_id}
                onValueChange={(value) => setFormData({ ...formData, room_type_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name} - ${type.base_price}/night
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "available" | "occupied" | "maintenance" | "blocked") =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any special notes about this room"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingRoom ? "Update" : "Create"} Room</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
