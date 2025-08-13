-- Seed data for Hotel Booking SaaS Platform

-- Create super admin user (replace with your actual details)
-- Note: You'll need to hash the password using bcrypt in your application
-- This is just an example - DO NOT use plain text passwords in production

-- Example super admin creation (you'll need to run this with proper password hash)
-- CALL create_super_admin('admin@yourplatform.com', '$2a$12$hashedpasswordhere', 'Platform Administrator');

-- Sample subscription plans data (this would typically be in your application code)
-- But here's the structure for reference:

-- Free Plan: 5 rooms, basic features
-- Starter Plan: 25 rooms, advanced booking management
-- Pro Plan: 100 rooms, full analytics, API access
-- Enterprise Plan: Unlimited rooms, white-label, priority support

-- Sample hotel data for testing (optional)
/*
INSERT INTO hotels (name, slug, description, address, city, state, country, owner_id, subscription_plan) VALUES
('Grand Plaza Hotel', 'grand-plaza', 'Luxury hotel in the heart of the city', '123 Main Street', 'New York', 'NY', 'USA', 'owner-user-id-here', 'pro'),
('Seaside Resort', 'seaside-resort', 'Beautiful beachfront resort', '456 Ocean Drive', 'Miami', 'FL', 'USA', 'owner-user-id-here', 'starter');
*/

-- Sample room types (optional)
/*
INSERT INTO room_types (hotel_id, name, description, base_price, max_occupancy, amenities) VALUES
('hotel-id-here', 'Standard Room', 'Comfortable room with city view', 150.00, 2, '["WiFi", "TV", "Air Conditioning"]'),
('hotel-id-here', 'Deluxe Suite', 'Spacious suite with premium amenities', 300.00, 4, '["WiFi", "TV", "Air Conditioning", "Mini Bar", "Balcony"]');
*/
