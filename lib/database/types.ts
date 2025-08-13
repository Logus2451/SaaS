// Database types for MySQL
export interface User {
  id: string
  email: string
  password_hash: string
  full_name: string | null
  role: "super_admin" | "hotel_owner" | "hotel_staff" | "guest"
  hotel_id: string | null
  email_verified: boolean
  reset_token: string | null
  reset_token_expires: Date | null
  created_at: Date
  updated_at: Date
}

export interface Hotel {
  id: string
  name: string
  slug: string
  description: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  postal_code: string | null
  phone: string | null
  email: string | null
  website: string | null
  owner_id: string
  subscription_plan: string
  subscription_status: string
  billing_cycle_start: Date | null
  billing_cycle_end: Date | null
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface RoomType {
  id: string
  hotel_id: string
  name: string
  description: string | null
  base_price: number
  max_occupancy: number
  amenities: string // JSON string
  images: string // JSON string
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface Room {
  id: string
  hotel_id: string
  room_type_id: string
  room_number: string
  floor: number | null
  status: "available" | "occupied" | "maintenance" | "blocked"
  notes: string | null
  created_at: Date
  updated_at: Date
}

export interface Booking {
  id: string
  hotel_id: string
  room_id: string
  guest_id: string | null
  guest_name: string
  guest_email: string
  guest_phone: string | null
  check_in_date: Date
  check_out_date: Date
  adults: number
  children: number
  total_amount: number
  status: "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled"
  special_requests: string | null
  booking_reference: string
  created_at: Date
  updated_at: Date
}

export interface BillingRecord {
  id: string
  hotel_id: string
  amount: number
  plan_name: string
  billing_period_start: Date
  billing_period_end: Date
  status: string
  due_date: Date
  paid_date: Date | null
  reminder_sent: boolean
  created_at: Date
  updated_at: Date
}

// Input types for creating records
export type CreateUser = Omit<User, "id" | "created_at" | "updated_at">
export type CreateHotel = Omit<Hotel, "id" | "created_at" | "updated_at">
export type CreateRoomType = Omit<RoomType, "id" | "created_at" | "updated_at">
export type CreateRoom = Omit<Room, "id" | "created_at" | "updated_at">
export type CreateBooking = Omit<Booking, "id" | "created_at" | "updated_at">
export type CreateBillingRecord = Omit<BillingRecord, "id" | "created_at" | "updated_at">

// Update types for updating records
export type UpdateUser = Partial<Omit<User, "id" | "created_at">> & { updated_at?: Date }
export type UpdateHotel = Partial<Omit<Hotel, "id" | "created_at">> & { updated_at?: Date }
export type UpdateRoomType = Partial<Omit<RoomType, "id" | "created_at">> & { updated_at?: Date }
export type UpdateRoom = Partial<Omit<Room, "id" | "created_at">> & { updated_at?: Date }
export type UpdateBooking = Partial<Omit<Booking, "id" | "created_at">> & { updated_at?: Date }
export type UpdateBillingRecord = Partial<Omit<BillingRecord, "id" | "created_at">> & { updated_at?: Date }
