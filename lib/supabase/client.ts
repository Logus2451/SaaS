import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: "super_admin" | "hotel_owner" | "hotel_staff" | "guest"
          hotel_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: "super_admin" | "hotel_owner" | "hotel_staff" | "guest"
          hotel_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: "super_admin" | "hotel_owner" | "hotel_staff" | "guest"
          hotel_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      hotels: {
        Row: {
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
          billing_cycle_start: string | null
          billing_cycle_end: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          postal_code?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          owner_id: string
          subscription_plan?: string
          subscription_status?: string
          billing_cycle_start?: string | null
          billing_cycle_end?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          postal_code?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          owner_id?: string
          subscription_plan?: string
          subscription_status?: string
          billing_cycle_start?: string | null
          billing_cycle_end?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      room_types: {
        Row: {
          id: string
          hotel_id: string
          name: string
          description: string | null
          base_price: number
          max_occupancy: number
          amenities: any[]
          images: any[]
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          hotel_id: string
          name: string
          description?: string | null
          base_price: number
          max_occupancy?: number
          amenities?: any[]
          images?: any[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          hotel_id?: string
          name?: string
          description?: string | null
          base_price?: number
          max_occupancy?: number
          amenities?: any[]
          images?: any[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      rooms: {
        Row: {
          id: string
          hotel_id: string
          room_type_id: string
          room_number: string
          floor: number | null
          status: "available" | "occupied" | "maintenance" | "blocked"
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          hotel_id: string
          room_type_id: string
          room_number: string
          floor?: number | null
          status?: "available" | "occupied" | "maintenance" | "blocked"
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          hotel_id?: string
          room_type_id?: string
          room_number?: string
          floor?: number | null
          status?: "available" | "occupied" | "maintenance" | "blocked"
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          hotel_id: string
          room_id: string
          guest_id: string | null
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
          booking_reference: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          hotel_id: string
          room_id: string
          guest_id?: string | null
          guest_name: string
          guest_email: string
          guest_phone?: string | null
          check_in_date: string
          check_out_date: string
          adults?: number
          children?: number
          total_amount: number
          status?: "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled"
          special_requests?: string | null
          booking_reference: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          hotel_id?: string
          room_id?: string
          guest_id?: string | null
          guest_name?: string
          guest_email?: string
          guest_phone?: string | null
          check_in_date?: string
          check_out_date?: string
          adults?: number
          children?: number
          total_amount?: number
          status?: "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled"
          special_requests?: string | null
          booking_reference?: string
          created_at?: string
          updated_at?: string
        }
      }
      billing_records: {
        Row: {
          id: string
          hotel_id: string
          amount: number
          plan_name: string
          billing_period_start: string
          billing_period_end: string
          status: string
          due_date: string
          paid_date: string | null
          reminder_sent: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          hotel_id: string
          amount: number
          plan_name: string
          billing_period_start: string
          billing_period_end: string
          status?: string
          due_date: string
          paid_date?: string | null
          reminder_sent?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          hotel_id?: string
          amount?: number
          plan_name?: string
          billing_period_start?: string
          billing_period_end?: string
          status?: string
          due_date?: string
          paid_date?: string | null
          reminder_sent?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
