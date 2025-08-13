-- RLS Policies for multi-tenant security

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Hotels policies
CREATE POLICY "Super admins can view all hotels" ON public.hotels
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Hotel owners can view own hotels" ON public.hotels
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Hotel owners can update own hotels" ON public.hotels
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Super admins can insert hotels" ON public.hotels
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Room types policies
CREATE POLICY "Hotel owners can manage room types" ON public.room_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.hotels 
      WHERE id = hotel_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "End users can view active room types" ON public.room_types
  FOR SELECT USING (is_active = true);

-- Rooms policies
CREATE POLICY "Hotel owners can manage rooms" ON public.rooms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.hotels 
      WHERE id = hotel_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "End users can view available rooms" ON public.rooms
  FOR SELECT USING (status = 'available');

-- Bookings policies
CREATE POLICY "Hotel owners can view hotel bookings" ON public.bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.hotels 
      WHERE id = hotel_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Hotel owners can manage hotel bookings" ON public.bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.hotels 
      WHERE id = hotel_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Guests can view own bookings" ON public.bookings
  FOR SELECT USING (guest_id = auth.uid());

CREATE POLICY "Anyone can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (true);

-- Hotel staff policies
CREATE POLICY "Hotel owners can manage staff" ON public.hotel_staff
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.hotels 
      WHERE id = hotel_id AND owner_id = auth.uid()
    )
  );

-- Billing policies
CREATE POLICY "Super admins can view all billing" ON public.billing
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Hotel owners can view own billing" ON public.billing
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.hotels 
      WHERE id = hotel_id AND owner_id = auth.uid()
    )
  );
