"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarInitials } from "@/components/ui/avatar"
import { Search, Plus, Phone, Mail, Calendar, Star, MessageSquare, User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Guest {
  id: string
  full_name: string
  email: string
  phone?: string
  preferences?: string
  notes?: string
  vip_status: boolean
  total_bookings: number
  total_spent: number
  last_visit?: string
  created_at: string
}

interface Booking {
  id: string
  reference: string
  check_in: string
  check_out: string
  status: string
  total_amount: number
  room_type: string
}

export function GuestManagement() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [guestBookings, setGuestBookings] = useState<Booking[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [isAddingGuest, setIsAddingGuest] = useState(false)

  // New guest form state
  const [newGuest, setNewGuest] = useState({
    full_name: "",
    email: "",
    phone: "",
    preferences: "",
    notes: "",
    vip_status: false,
  })

  const supabase = createClient()

  useEffect(() => {
    fetchGuests()
  }, [])

  const fetchGuests = async () => {
    try {
      // Mock data for demonstration - replace with actual Supabase query
      const mockGuests: Guest[] = [
        {
          id: "1",
          full_name: "John Smith",
          email: "john.smith@email.com",
          phone: "+1 (555) 123-4567",
          preferences: "Non-smoking room, high floor, late checkout",
          notes: "Regular business traveler, prefers quiet rooms",
          vip_status: true,
          total_bookings: 12,
          total_spent: 8400,
          last_visit: "2024-01-15",
          created_at: "2023-06-15",
        },
        {
          id: "2",
          full_name: "Sarah Johnson",
          email: "sarah.j@email.com",
          phone: "+1 (555) 987-6543",
          preferences: "Ocean view, extra towels",
          notes: "Celebrates anniversary every year",
          vip_status: false,
          total_bookings: 3,
          total_spent: 1200,
          last_visit: "2024-01-08",
          created_at: "2023-11-20",
        },
        {
          id: "3",
          full_name: "Michael Chen",
          email: "m.chen@email.com",
          phone: "+1 (555) 456-7890",
          preferences: "Gym access, healthy breakfast options",
          notes: "Fitness enthusiast, early riser",
          vip_status: false,
          total_bookings: 7,
          total_spent: 3500,
          last_visit: "2024-01-20",
          created_at: "2023-08-10",
        },
      ]

      setGuests(mockGuests)
    } catch (error) {
      console.error("Error fetching guests:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchGuestBookings = async (guestId: string) => {
    try {
      // Mock booking data - replace with actual Supabase query
      const mockBookings: Booking[] = [
        {
          id: "1",
          reference: "BK-2024-001",
          check_in: "2024-01-15",
          check_out: "2024-01-18",
          status: "completed",
          total_amount: 450,
          room_type: "Deluxe Suite",
        },
        {
          id: "2",
          reference: "BK-2023-089",
          check_in: "2023-12-20",
          check_out: "2023-12-23",
          status: "completed",
          total_amount: 380,
          room_type: "Standard Room",
        },
      ]

      setGuestBookings(mockBookings)
    } catch (error) {
      console.error("Error fetching guest bookings:", error)
    }
  }

  const handleAddGuest = async () => {
    try {
      // Add guest logic here
      console.log("Adding guest:", newGuest)
      setIsAddingGuest(false)
      setNewGuest({
        full_name: "",
        email: "",
        phone: "",
        preferences: "",
        notes: "",
        vip_status: false,
      })
      fetchGuests()
    } catch (error) {
      console.error("Error adding guest:", error)
    }
  }

  const handleGuestSelect = (guest: Guest) => {
    setSelectedGuest(guest)
    fetchGuestBookings(guest.id)
  }

  const filteredGuests = guests.filter(
    (guest) =>
      guest.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return <div>Loading guests...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search guests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Dialog open={isAddingGuest} onOpenChange={setIsAddingGuest}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Guest
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Guest</DialogTitle>
              <DialogDescription>Create a new guest profile</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newGuest.full_name}
                  onChange={(e) => setNewGuest({ ...newGuest, full_name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newGuest.email}
                  onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newGuest.phone}
                  onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferences">Preferences</Label>
                <Textarea
                  id="preferences"
                  value={newGuest.preferences}
                  onChange={(e) => setNewGuest({ ...newGuest, preferences: e.target.value })}
                  placeholder="Room preferences, special requests..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newGuest.notes}
                  onChange={(e) => setNewGuest({ ...newGuest, notes: e.target.value })}
                  placeholder="Internal notes about the guest..."
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="vip"
                  checked={newGuest.vip_status}
                  onChange={(e) => setNewGuest({ ...newGuest, vip_status: e.target.checked })}
                />
                <Label htmlFor="vip">VIP Status</Label>
              </div>
              <Button onClick={handleAddGuest} className="w-full">
                Add Guest
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Guests List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Guests ({filteredGuests.length})</CardTitle>
              <CardDescription>Click on a guest to view details</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {filteredGuests.map((guest) => (
                  <div
                    key={guest.id}
                    onClick={() => handleGuestSelect(guest)}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                      selectedGuest?.id === guest.id ? "bg-blue-50 border-blue-200" : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          <AvatarInitials name={guest.full_name} />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900 truncate">{guest.full_name}</p>
                          {guest.vip_status && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              <Star className="h-3 w-3 mr-1" />
                              VIP
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">{guest.email}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-400">{guest.total_bookings} bookings</span>
                          <span className="text-xs text-gray-400">${guest.total_spent}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Guest Details */}
        <div className="lg:col-span-2">
          {selectedGuest ? (
            <Tabs defaultValue="profile" className="space-y-4">
              <TabsList>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="bookings">Booking History</TabsTrigger>
                <TabsTrigger value="communication">Communication</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback>
                          <AvatarInitials name={selectedGuest.full_name} />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <CardTitle>{selectedGuest.full_name}</CardTitle>
                          {selectedGuest.vip_status && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              <Star className="h-3 w-3 mr-1" />
                              VIP
                            </Badge>
                          )}
                        </div>
                        <CardDescription>
                          Guest since {new Date(selectedGuest.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{selectedGuest.email}</span>
                        </div>
                        {selectedGuest.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{selectedGuest.phone}</span>
                          </div>
                        )}
                        {selectedGuest.last_visit && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              Last visit: {new Date(selectedGuest.last_visit).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-gray-900">Total Bookings</p>
                          <p className="text-2xl font-bold text-blue-600">{selectedGuest.total_bookings}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-gray-900">Total Spent</p>
                          <p className="text-2xl font-bold text-green-600">${selectedGuest.total_spent}</p>
                        </div>
                      </div>
                    </div>

                    {selectedGuest.preferences && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Preferences</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedGuest.preferences}</p>
                      </div>
                    )}

                    {selectedGuest.notes && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Internal Notes</h4>
                        <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                          {selectedGuest.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bookings">
                <Card>
                  <CardHeader>
                    <CardTitle>Booking History</CardTitle>
                    <CardDescription>All bookings for {selectedGuest.full_name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {guestBookings.map((booking) => (
                        <div key={booking.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{booking.reference}</p>
                              <p className="text-sm text-gray-600">{booking.room_type}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(booking.check_in).toLocaleDateString()} -{" "}
                                {new Date(booking.check_out).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge variant={booking.status === "completed" ? "default" : "secondary"}>
                                {booking.status}
                              </Badge>
                              <p className="text-lg font-bold text-green-600 mt-1">${booking.total_amount}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="communication">
                <Card>
                  <CardHeader>
                    <CardTitle>Communication Log</CardTitle>
                    <CardDescription>Messages and interactions with {selectedGuest.full_name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center text-gray-500 py-8">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No communication history yet</p>
                        <Button variant="outline" className="mt-4 bg-transparent">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send Message
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a guest to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
