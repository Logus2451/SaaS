-- Fixed table creation order to avoid foreign key constraint errors
-- Removed the problematic JWT secret line that causes permission errors in Supabase

-- Drop existing types first to avoid "already exists" errors
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS subscription_plan CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS room_status CASCADE;

-- Create custom types
CREATE TYPE user_role AS ENUM ('super_admin', 'hotel_owner', 'hotel_staff', 'end_user');
CREATE TYPE subscription_plan AS ENUM ('free', 'starter', 'pro', 'enterprise');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled');
CREATE TYPE room_status AS ENUM ('available', 'occupied', 'maintenance', 'blocked');

-- Create users table first without hotel_id foreign key
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'end_user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hotels table (multi-tenant core)
CREATE TABLE IF NOT EXISTS public.hotels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- for custom URLs like hotel-abc.yourdomain.com
  description TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  subscription_plan subscription_plan DEFAULT 'free',
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Now add hotel_id column and foreign key constraint after hotels table exists
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS hotel_id UUID;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_hotel_id_fkey;
ALTER TABLE public.users ADD CONSTRAINT users_hotel_id_fkey 
  FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON DELETE SET NULL;

-- Room types table
CREATE TABLE IF NOT EXISTS public.room_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  max_occupancy INTEGER NOT NULL DEFAULT 2,
  amenities JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE NOT NULL,
  room_type_id UUID REFERENCES public.room_types(id) ON DELETE CASCADE NOT NULL,
  room_number TEXT NOT NULL,
  floor INTEGER,
  status room_status DEFAULT 'available',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(hotel_id, room_number)
);

-- Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE NOT NULL,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  guest_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  adults INTEGER NOT NULL DEFAULT 1,
  children INTEGER DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  status booking_status DEFAULT 'pending',
  special_requests TEXT,
  booking_reference TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hotel staff table (for hotel employees)
CREATE TABLE IF NOT EXISTS public.hotel_staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff', -- staff, manager, etc.
  permissions JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(hotel_id, user_id)
);

-- Billing table for subscription management
CREATE TABLE IF NOT EXISTS public.billing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE NOT NULL,
  subscription_plan subscription_plan NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending', -- pending, paid, overdue, cancelled
  stripe_invoice_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_hotel_id ON public.users(hotel_id);
CREATE INDEX IF NOT EXISTS idx_hotels_owner_id ON public.hotels(owner_id);
CREATE INDEX IF NOT EXISTS idx_hotels_slug ON public.hotels(slug);
CREATE INDEX IF NOT EXISTS idx_room_types_hotel_id ON public.room_types(hotel_id);
CREATE INDEX IF NOT EXISTS idx_rooms_hotel_id ON public.rooms(hotel_id);
CREATE INDEX IF NOT EXISTS idx_rooms_room_type_id ON public.rooms(room_type_id);
CREATE INDEX IF NOT EXISTS idx_bookings_hotel_id ON public.bookings(hotel_id);
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON public.bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON public.bookings(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_hotel_staff_hotel_id ON public.hotel_staff(hotel_id);
CREATE INDEX IF NOT EXISTS idx_billing_hotel_id ON public.billing(hotel_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing ENABLE ROW LEVEL SECURITY;
