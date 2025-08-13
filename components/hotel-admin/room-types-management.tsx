"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase/client"
import { Plus, Edit, Trash2, Users, DollarSign } from "lucide-react"

interface RoomType {
  id: string
  name: string
  description: string | null
  base_price: number
  max_occupancy: number
  amenities: string[]
  is_active: boolean
  created_at: string
}

interface RoomTypesManagementProps {
  hotelId: string
  onUpdate: () => void
}

export default function RoomTypesManagement({ hotelId, onUpdate }: RoomTypesManagementProps) {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    base_price: "",
    max_occupancy: "2",
    amenities: "",
  })

  useEffect(() => {
    loadRoomTypes()
  }, [hotelId])

  const loadRoomTypes = async () => {
    try {
      const { data, error } = await supabase
        .from("room_types")
        .select("*")
        .eq("hotel_id", hotelId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading room types:", error)
        return
      }

      setRoomTypes(data || [])
    } catch (error) {
      console.error("Error loading room types:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const amenitiesArray = formData.amenities
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a.length > 0)

      const roomTypeData = {
        hotel_id: hotelId,
        name: formData.name,
        description: formData.description || null,
        base_price: Number.parseFloat(formData.base_price),
        max_occupancy: Number.parseInt(formData.max_occupancy),
        amenities: amenitiesArray,
        is_active: true,
      }

      if (editingRoomType) {
        const { error } = await supabase.from("room_types").update(roomTypeData).eq("id", editingRoomType.id)

        if (error) {
          setError(error.message)
          return
        }
      } else {
        const { error } = await supabase.from("room_types").insert(roomTypeData)

        if (error) {
          setError(error.message)
          return
        }
      }

      // Reset form and close dialog
      setFormData({
        name: "",
        description: "",
        base_price: "",
        max_occupancy: "2",
        amenities: "",
      })
      setEditingRoomType(null)
      setShowDialog(false)
      await loadRoomTypes()
      onUpdate()
    } catch (error) {
      setError("An unexpected error occurred")
    }
  }

  const handleEdit = (roomType: RoomType) => {
    setEditingRoomType(roomType)
    setFormData({
      name: roomType.name,
      description: roomType.description || "",
      base_price: roomType.base_price.toString(),
      max_occupancy: roomType.max_occupancy.toString(),
      amenities: roomType.amenities.join(", "),
    })
    setShowDialog(true)
  }

  const handleDelete = async (roomTypeId: string) => {
    if (!confirm("Are you sure you want to delete this room type?")) {
      return
    }

    try {
      const { error } = await supabase.from("room_types").delete().eq("id", roomTypeId)

      if (error) {
        console.error("Error deleting room type:", error)
        return
      }

      await loadRoomTypes()
      onUpdate()
    } catch (error) {
      console.error("Error deleting room type:", error)
    }
  }

  const openNewDialog = () => {
    setEditingRoomType(null)
    setFormData({
      name: "",
      description: "",
      base_price: "",
      max_occupancy: "2",
      amenities: "",
    })
    setShowDialog(true)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading room types...</div>
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
              <CardTitle>Room Types</CardTitle>
              <CardDescription>Manage the different types of rooms in your hotel</CardDescription>
            </div>
            <Button onClick={openNewDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Room Type
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {roomTypes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No room types found</p>
              <Button onClick={openNewDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Room Type
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roomTypes.map((roomType) => (
                <Card key={roomType.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{roomType.name}</CardTitle>
                        <CardDescription>{roomType.description}</CardDescription>
                      </div>
                      <Badge variant={roomType.is_active ? "default" : "secondary"}>
                        {roomType.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                          <span className="font-semibold">${roomType.base_price}/night</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-blue-600 mr-1" />
                          <span className="text-sm">Max {roomType.max_occupancy}</span>
                        </div>
                      </div>

                      {roomType.amenities.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Amenities:</p>
                          <div className="flex flex-wrap gap-1">
                            {roomType.amenities.slice(0, 3).map((amenity, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                            {roomType.amenities.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{roomType.amenities.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2">
                        <p className="text-xs text-muted-foreground">
                          Created {new Date(roomType.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(roomType)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(roomType.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
            <DialogTitle>{editingRoomType ? "Edit Room Type" : "Add New Room Type"}</DialogTitle>
            <DialogDescription>
              {editingRoomType ? "Update the room type details" : "Create a new room type for your hotel"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Room Type Name</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Deluxe Suite, Standard Room"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the room type"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="base_price">Base Price ($)</Label>
                <Input
                  id="base_price"
                  type="number"
                  step="0.01"
                  required
                  value={formData.base_price}
                  onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                  placeholder="99.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_occupancy">Max Occupancy</Label>
                <Input
                  id="max_occupancy"
                  type="number"
                  min="1"
                  required
                  value={formData.max_occupancy}
                  onChange={(e) => setFormData({ ...formData, max_occupancy: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amenities">Amenities (comma-separated)</Label>
              <Input
                id="amenities"
                value={formData.amenities}
                onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                placeholder="WiFi, TV, Air Conditioning, Mini Bar"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingRoomType ? "Update" : "Create"} Room Type</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
