-- MySQL Functions and Procedures for Hotel Booking System

DELIMITER //

-- Function to generate booking reference
CREATE FUNCTION generate_booking_reference()
RETURNS VARCHAR(10)
READS SQL DATA
DETERMINISTIC
BEGIN
  DECLARE ref_code VARCHAR(10);
  DECLARE counter INT DEFAULT 0;
  
  -- Generate random alphanumeric code
  REPEAT
    SET ref_code = CONCAT(
      CHAR(65 + FLOOR(RAND() * 26)),  -- Random letter A-Z
      CHAR(65 + FLOOR(RAND() * 26)),  -- Random letter A-Z
      LPAD(FLOOR(RAND() * 10000), 4, '0')  -- Random 4-digit number
    );
    
    -- Check if reference already exists
    SELECT COUNT(*) INTO counter FROM bookings WHERE booking_reference = ref_code;
    
  UNTIL counter = 0 END REPEAT;
  
  RETURN ref_code;
END//

-- Function to check room availability
CREATE FUNCTION is_room_available(
  p_room_id CHAR(36),
  p_check_in DATE,
  p_check_out DATE
)
RETURNS BOOLEAN
READS SQL DATA
DETERMINISTIC
BEGIN
  DECLARE conflict_count INT DEFAULT 0;
  
  SELECT COUNT(*) INTO conflict_count
  FROM bookings
  WHERE room_id = p_room_id
    AND status IN ('confirmed', 'checked_in')
    AND (
      (check_in_date < p_check_out AND check_out_date > p_check_in)
    );
  
  RETURN conflict_count = 0;
END//

-- Function to calculate occupancy rate for a hotel
CREATE FUNCTION calculate_occupancy_rate(
  p_hotel_id CHAR(36),
  p_start_date DATE,
  p_end_date DATE
)
RETURNS DECIMAL(5,2)
READS SQL DATA
DETERMINISTIC
BEGIN
  DECLARE total_room_nights INT DEFAULT 0;
  DECLARE occupied_nights INT DEFAULT 0;
  DECLARE occupancy_rate DECIMAL(5,2) DEFAULT 0.00;
  DECLARE days_diff INT;
  
  -- Calculate total possible room nights
  SELECT DATEDIFF(p_end_date, p_start_date) INTO days_diff;
  SELECT COUNT(*) * days_diff INTO total_room_nights
  FROM rooms
  WHERE hotel_id = p_hotel_id AND status = 'available';
  
  -- Calculate occupied nights
  SELECT COUNT(*) INTO occupied_nights
  FROM bookings b
  JOIN rooms r ON b.room_id = r.id
  WHERE r.hotel_id = p_hotel_id
    AND b.status IN ('confirmed', 'checked_in', 'checked_out')
    AND b.check_in_date < p_end_date
    AND b.check_out_date > p_start_date;
  
  -- Calculate occupancy rate
  IF total_room_nights > 0 THEN
    SET occupancy_rate = (occupied_nights / total_room_nights) * 100;
  END IF;
  
  RETURN occupancy_rate;
END//

-- Procedure to update room status based on bookings
CREATE PROCEDURE update_room_statuses()
BEGIN
  DECLARE done INT DEFAULT FALSE;
  DECLARE v_room_id CHAR(36);
  DECLARE v_status VARCHAR(20);
  
  DECLARE room_cursor CURSOR FOR
    SELECT DISTINCT r.id,
      CASE
        WHEN EXISTS (
          SELECT 1 FROM bookings b
          WHERE b.room_id = r.id
            AND b.status = 'checked_in'
            AND CURDATE() BETWEEN b.check_in_date AND b.check_out_date
        ) THEN 'occupied'
        ELSE 'available'
      END as new_status
    FROM rooms r
    WHERE r.status IN ('available', 'occupied');
  
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
  
  OPEN room_cursor;
  
  read_loop: LOOP
    FETCH room_cursor INTO v_room_id, v_status;
    IF done THEN
      LEAVE read_loop;
    END IF;
    
    UPDATE rooms SET status = v_status WHERE id = v_room_id;
  END LOOP;
  
  CLOSE room_cursor;
END//

-- Procedure to create super admin user
CREATE PROCEDURE create_super_admin(
  IN p_email VARCHAR(255),
  IN p_password_hash VARCHAR(255),
  IN p_full_name VARCHAR(255)
)
BEGIN
  DECLARE user_exists INT DEFAULT 0;
  
  -- Check if user already exists
  SELECT COUNT(*) INTO user_exists FROM users WHERE email = p_email;
  
  IF user_exists = 0 THEN
    INSERT INTO users (email, password_hash, full_name, role, email_verified)
    VALUES (p_email, p_password_hash, p_full_name, 'super_admin', TRUE);
    
    SELECT 'Super admin user created successfully' as message;
  ELSE
    -- Update existing user to super admin
    UPDATE users 
    SET role = 'super_admin', 
        password_hash = p_password_hash,
        full_name = p_full_name,
        email_verified = TRUE
    WHERE email = p_email;
    
    SELECT 'Existing user updated to super admin' as message;
  END IF;
END//

DELIMITER ;
