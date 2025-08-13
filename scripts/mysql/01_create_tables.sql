-- MySQL Database Schema for Hotel Booking SaaS Platform
-- Convert from PostgreSQL to MySQL syntax

-- Create database (run this first in your cPanel MySQL)
-- CREATE DATABASE hotel_booking_saas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE hotel_booking_saas;

-- Drop existing tables if they exist (in reverse order due to foreign keys)
DROP TABLE IF EXISTS billing_records;
DROP TABLE IF EXISTS hotel_staff;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS room_types;
DROP TABLE IF EXISTS hotels;
DROP TABLE IF EXISTS users;

-- Users table (authentication and user management)
CREATE TABLE users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role ENUM('super_admin', 'hotel_owner', 'hotel_staff', 'guest') NOT NULL DEFAULT 'guest',
  hotel_id CHAR(36) NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  reset_token CHAR(36) NULL,
  reset_token_expires TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_users_email (email),
  INDEX idx_users_hotel_id (hotel_id),
  INDEX idx_users_reset_token (reset_token)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Hotels table (multi-tenant core)
CREATE TABLE hotels (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(255),
  owner_id CHAR(36) NOT NULL,
  subscription_plan ENUM('free', 'starter', 'pro', 'enterprise') DEFAULT 'free',
  subscription_status ENUM('active', 'inactive', 'cancelled', 'past_due') DEFAULT 'active',
  billing_cycle_start DATE NULL,
  billing_cycle_end DATE NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_hotels_owner_id (owner_id),
  INDEX idx_hotels_slug (slug),
  INDEX idx_hotels_subscription (subscription_plan, subscription_status),
  
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add foreign key constraint for users.hotel_id after hotels table is created
ALTER TABLE users ADD CONSTRAINT fk_users_hotel_id 
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE SET NULL;

-- Room types table
CREATE TABLE room_types (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  hotel_id CHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  max_occupancy INT NOT NULL DEFAULT 2,
  amenities JSON,
  images JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_room_types_hotel_id (hotel_id),
  INDEX idx_room_types_active (hotel_id, is_active),
  
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Rooms table
CREATE TABLE rooms (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  hotel_id CHAR(36) NOT NULL,
  room_type_id CHAR(36) NOT NULL,
  room_number VARCHAR(50) NOT NULL,
  floor INT,
  status ENUM('available', 'occupied', 'maintenance', 'blocked') DEFAULT 'available',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_room_per_hotel (hotel_id, room_number),
  INDEX idx_rooms_hotel_id (hotel_id),
  INDEX idx_rooms_room_type_id (room_type_id),
  INDEX idx_rooms_status (hotel_id, status),
  
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
  FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Bookings table
CREATE TABLE bookings (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  hotel_id CHAR(36) NOT NULL,
  room_id CHAR(36) NOT NULL,
  guest_id CHAR(36) NULL,
  guest_name VARCHAR(255) NOT NULL,
  guest_email VARCHAR(255) NOT NULL,
  guest_phone VARCHAR(50),
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  adults INT NOT NULL DEFAULT 1,
  children INT DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled') DEFAULT 'pending',
  special_requests TEXT,
  booking_reference VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_bookings_hotel_id (hotel_id),
  INDEX idx_bookings_room_id (room_id),
  INDEX idx_bookings_guest_id (guest_id),
  INDEX idx_bookings_dates (hotel_id, check_in_date, check_out_date),
  INDEX idx_bookings_reference (booking_reference),
  INDEX idx_bookings_status (hotel_id, status),
  
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (guest_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Hotel staff table (for hotel employees)
CREATE TABLE hotel_staff (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  hotel_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'staff',
  permissions JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_staff_per_hotel (hotel_id, user_id),
  INDEX idx_hotel_staff_hotel_id (hotel_id),
  INDEX idx_hotel_staff_user_id (user_id),
  
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Billing records table for subscription management
CREATE TABLE billing_records (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  hotel_id CHAR(36) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  plan_name VARCHAR(50) NOT NULL,
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
  due_date DATE NOT NULL,
  paid_date TIMESTAMP NULL,
  reminder_sent BOOLEAN DEFAULT FALSE,
  stripe_invoice_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_billing_hotel_id (hotel_id),
  INDEX idx_billing_status (status),
  INDEX idx_billing_due_date (due_date),
  
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create triggers for updated_at timestamps (MySQL doesn't auto-update all timestamp columns)
DELIMITER //

CREATE TRIGGER tr_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

CREATE TRIGGER tr_hotels_updated_at
  BEFORE UPDATE ON hotels
  FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

CREATE TRIGGER tr_room_types_updated_at
  BEFORE UPDATE ON room_types
  FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

CREATE TRIGGER tr_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

CREATE TRIGGER tr_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

CREATE TRIGGER tr_billing_records_updated_at
  BEFORE UPDATE ON billing_records
  FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

DELIMITER ;
