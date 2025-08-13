import { executeQuery, executeSingle } from "./connection"
import type {
  User,
  Hotel,
  RoomType,
  Room,
  Booking,
  CreateUser,
  CreateHotel,
  CreateRoomType,
  CreateRoom,
  CreateBooking,
  UpdateUser,
  UpdateHotel,
  UpdateBooking,
} from "./types"
import { v4 as uuidv4 } from "uuid"

// User queries
export const userQueries = {
  async findById(id: string): Promise<User | null> {
    const users = await executeQuery<User>("SELECT * FROM users WHERE id = ?", [id])
    return users[0] || null
  },

  async findByEmail(email: string): Promise<User | null> {
    const users = await executeQuery<User>("SELECT * FROM users WHERE email = ?", [email])
    return users[0] || null
  },

  async findByResetToken(token: string): Promise<User | null> {
    const users = await executeQuery<User>(
      "SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()",
      [token],
    )
    return users[0] || null
  },

  async create(userData: CreateUser): Promise<string> {
    const id = uuidv4()
    await executeSingle(
      `INSERT INTO users (id, email, password_hash, full_name, role, hotel_id, email_verified, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        id,
        userData.email,
        userData.password_hash,
        userData.full_name,
        userData.role,
        userData.hotel_id,
        userData.email_verified,
      ],
    )
    return id
  },

  async update(id: string, userData: UpdateUser): Promise<void> {
    const fields = Object.keys(userData).filter((key) => key !== "updated_at")
    const values = fields.map((field) => userData[field as keyof UpdateUser])
    const setClause = fields.map((field) => `${field} = ?`).join(", ")

    await executeSingle(`UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = ?`, [...values, id])
  },

  async delete(id: string): Promise<void> {
    await executeSingle("DELETE FROM users WHERE id = ?", [id])
  },
}

// Hotel queries
export const hotelQueries = {
  async findById(id: string): Promise<Hotel | null> {
    const hotels = await executeQuery<Hotel>("SELECT * FROM hotels WHERE id = ?", [id])
    return hotels[0] || null
  },

  async findBySlug(slug: string): Promise<Hotel | null> {
    const hotels = await executeQuery<Hotel>("SELECT * FROM hotels WHERE slug = ?", [slug])
    return hotels[0] || null
  },

  async findByOwnerId(ownerId: string): Promise<Hotel[]> {
    return executeQuery<Hotel>("SELECT * FROM hotels WHERE owner_id = ?", [ownerId])
  },

  async findAll(): Promise<Hotel[]> {
    return executeQuery<Hotel>("SELECT * FROM hotels ORDER BY created_at DESC")
  },

  async create(hotelData: CreateHotel): Promise<string> {
    const id = uuidv4()
    await executeSingle(
      `INSERT INTO hotels (id, name, slug, description, address, city, state, country, postal_code, phone, email, website, owner_id, subscription_plan, subscription_status, billing_cycle_start, billing_cycle_end, is_active, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        id,
        hotelData.name,
        hotelData.slug,
        hotelData.description,
        hotelData.address,
        hotelData.city,
        hotelData.state,
        hotelData.country,
        hotelData.postal_code,
        hotelData.phone,
        hotelData.email,
        hotelData.website,
        hotelData.owner_id,
        hotelData.subscription_plan,
        hotelData.subscription_status,
        hotelData.billing_cycle_start,
        hotelData.billing_cycle_end,
        hotelData.is_active,
      ],
    )
    return id
  },

  async update(id: string, hotelData: UpdateHotel): Promise<void> {
    const fields = Object.keys(hotelData).filter((key) => key !== "updated_at")
    const values = fields.map((field) => hotelData[field as keyof UpdateHotel])
    const setClause = fields.map((field) => `${field} = ?`).join(", ")

    await executeSingle(`UPDATE hotels SET ${setClause}, updated_at = NOW() WHERE id = ?`, [...values, id])
  },
}

// Room Type queries
export const roomTypeQueries = {
  async findByHotelId(hotelId: string): Promise<RoomType[]> {
    return executeQuery<RoomType>("SELECT * FROM room_types WHERE hotel_id = ? AND is_active = true", [hotelId])
  },

  async findById(id: string): Promise<RoomType | null> {
    const roomTypes = await executeQuery<RoomType>("SELECT * FROM room_types WHERE id = ?", [id])
    return roomTypes[0] || null
  },

  async create(roomTypeData: CreateRoomType): Promise<string> {
    const id = uuidv4()
    await executeSingle(
      `INSERT INTO room_types (id, hotel_id, name, description, base_price, max_occupancy, amenities, images, is_active, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        id,
        roomTypeData.hotel_id,
        roomTypeData.name,
        roomTypeData.description,
        roomTypeData.base_price,
        roomTypeData.max_occupancy,
        roomTypeData.amenities,
        roomTypeData.images,
        roomTypeData.is_active,
      ],
    )
    return id
  },
}

// Room queries
export const roomQueries = {
  async findByHotelId(hotelId: string): Promise<Room[]> {
    return executeQuery<Room>("SELECT * FROM rooms WHERE hotel_id = ?", [hotelId])
  },

  async findAvailable(hotelId: string, checkIn: Date, checkOut: Date): Promise<Room[]> {
    return executeQuery<Room>(
      `SELECT r.* FROM rooms r 
       WHERE r.hotel_id = ? AND r.status = 'available'
       AND r.id NOT IN (
         SELECT room_id FROM bookings 
         WHERE hotel_id = ? 
         AND status IN ('confirmed', 'checked_in')
         AND (check_in_date < ? AND check_out_date > ?)
       )`,
      [hotelId, hotelId, checkOut, checkIn],
    )
  },

  async create(roomData: CreateRoom): Promise<string> {
    const id = uuidv4()
    await executeSingle(
      `INSERT INTO rooms (id, hotel_id, room_type_id, room_number, floor, status, notes, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        id,
        roomData.hotel_id,
        roomData.room_type_id,
        roomData.room_number,
        roomData.floor,
        roomData.status,
        roomData.notes,
      ],
    )
    return id
  },
}

// Booking queries
export const bookingQueries = {
  async findByHotelId(hotelId: string): Promise<Booking[]> {
    return executeQuery<Booking>("SELECT * FROM bookings WHERE hotel_id = ? ORDER BY created_at DESC", [hotelId])
  },

  async findByReference(reference: string): Promise<Booking | null> {
    const bookings = await executeQuery<Booking>("SELECT * FROM bookings WHERE booking_reference = ?", [reference])
    return bookings[0] || null
  },

  async create(bookingData: CreateBooking): Promise<string> {
    const id = uuidv4()
    await executeSingle(
      `INSERT INTO bookings (id, hotel_id, room_id, guest_id, guest_name, guest_email, guest_phone, check_in_date, check_out_date, adults, children, total_amount, status, special_requests, booking_reference, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        id,
        bookingData.hotel_id,
        bookingData.room_id,
        bookingData.guest_id,
        bookingData.guest_name,
        bookingData.guest_email,
        bookingData.guest_phone,
        bookingData.check_in_date,
        bookingData.check_out_date,
        bookingData.adults,
        bookingData.children,
        bookingData.total_amount,
        bookingData.status,
        bookingData.special_requests,
        bookingData.booking_reference,
      ],
    )
    return id
  },

  async update(id: string, bookingData: UpdateBooking): Promise<void> {
    const fields = Object.keys(bookingData).filter((key) => key !== "updated_at")
    const values = fields.map((field) => bookingData[field as keyof UpdateBooking])
    const setClause = fields.map((field) => `${field} = ?`).join(", ")

    await executeSingle(`UPDATE bookings SET ${setClause}, updated_at = NOW() WHERE id = ?`, [...values, id])
  },
}
