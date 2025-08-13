-- Utility functions for the hotel booking system

-- Function to generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT AS $$
BEGIN
  RETURN 'BK' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to check room availability
CREATE OR REPLACE FUNCTION check_room_availability(
  p_room_id UUID,
  p_check_in DATE,
  p_check_out DATE
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.bookings
    WHERE room_id = p_room_id
    AND status NOT IN ('cancelled')
    AND (
      (check_in_date <= p_check_in AND check_out_date > p_check_in)
      OR (check_in_date < p_check_out AND check_out_date >= p_check_out)
      OR (check_in_date >= p_check_in AND check_out_date <= p_check_out)
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get hotel occupancy rate
CREATE OR REPLACE FUNCTION get_hotel_occupancy_rate(
  p_hotel_id UUID,
  p_date DATE
)
RETURNS DECIMAL AS $$
DECLARE
  total_rooms INTEGER;
  occupied_rooms INTEGER;
BEGIN
  -- Get total rooms
  SELECT COUNT(*) INTO total_rooms
  FROM public.rooms
  WHERE hotel_id = p_hotel_id AND status = 'available';
  
  -- Get occupied rooms for the date
  SELECT COUNT(*) INTO occupied_rooms
  FROM public.bookings b
  JOIN public.rooms r ON b.room_id = r.id
  WHERE r.hotel_id = p_hotel_id
  AND b.status IN ('confirmed', 'checked_in')
  AND p_date >= b.check_in_date
  AND p_date < b.check_out_date;
  
  IF total_rooms = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN ROUND((occupied_rooms::DECIMAL / total_rooms::DECIMAL) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON public.hotels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_room_types_updated_at BEFORE UPDATE ON public.room_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
