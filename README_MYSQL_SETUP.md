# MySQL Setup Guide for cPanel Hosting

This guide will help you set up the MySQL database for your hotel booking SaaS platform on cPanel hosting.

## Step 1: Create MySQL Database in cPanel

1. **Login to cPanel**
   - Access your hosting provider's cPanel interface
   - Navigate to the "Databases" section

2. **Create Database**
   - Click on "MySQL Databases"
   - Under "Create New Database", enter: `hotel_booking`
   - Click "Create Database"
   - Note: The actual database name will be prefixed with your cPanel username (e.g., `username_hotel_booking`)

3. **Create Database User**
   - Under "MySQL Users", create a new user
   - Username: `hotel_admin` (will be prefixed with your cPanel username)
   - Set a strong password and save it securely
   - Click "Create User"

4. **Grant Privileges**
   - Under "Add User to Database", select your user and database
   - Grant "ALL PRIVILEGES"
   - Click "Make Changes"

5. **Get Connection Details**
   - Database Host: Usually `localhost` (check with your hosting provider)
   - Database Name: `your_cpanel_username_hotel_booking`
   - Username: `your_cpanel_username_hotel_admin`
   - Password: The password you set above
   - Port: `3306` (default MySQL port)

## Step 2: Configure Environment Variables

1. **Copy Environment File**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

2. **Update Database Configuration**
   \`\`\`env
   DB_HOST=localhost
   DB_USER=your_cpanel_username_hotel_admin
   DB_PASSWORD=your_secure_password
   DB_NAME=your_cpanel_username_hotel_booking
   DB_PORT=3306
   DB_SSL=false
   \`\`\`

3. **Generate JWT Secret**
   \`\`\`bash
   # Generate a secure JWT secret
   openssl rand -base64 32
   \`\`\`
   
   Add the generated string to your `.env.local`:
   \`\`\`env
   JWT_SECRET=your_generated_secure_jwt_secret_here
   \`\`\`

## Step 3: Run Database Scripts

Execute these SQL scripts in your cPanel phpMyAdmin or MySQL interface in order:

1. **Create Tables**
   - Run `scripts/mysql/01_create_tables.sql`
   - This creates all the necessary tables and indexes

2. **Create Functions**
   - Run `scripts/mysql/02_create_functions.sql`
   - This creates stored procedures and functions

3. **Seed Data (Optional)**
   - Run `scripts/mysql/03_seed_data.sql`
   - This adds sample data for testing

4. **Create Super Admin**
   - Follow instructions in `scripts/mysql/04_create_super_admin.sql`
   - This sets up your admin account

## Step 4: Test Connection

1. **Start Your Application**
   \`\`\`bash
   npm run dev
   \`\`\`

2. **Check Database Connection**
   - The application will attempt to connect to MySQL on startup
   - Check the console for any connection errors

3. **Create Super Admin Account**
   - Go to `/auth/signup` and create an account with your admin email
   - Run the SQL command to upgrade your account to super admin:
   \`\`\`sql
   UPDATE users SET role = 'super_admin', email_verified = TRUE WHERE email = 'your-admin-email@domain.com';
   \`\`\`

## Step 5: Deploy to Production

1. **Update Environment Variables**
   - Set the same environment variables in your hosting provider's environment variable section
   - Or create a `.env.local` file on your production server

2. **Database Security**
   - Ensure your database user has only the necessary privileges
   - Use strong passwords
   - Consider restricting database access to specific IP addresses if possible

## Troubleshooting

### Connection Issues
- Verify your database credentials in cPanel
- Check if your hosting provider uses a different MySQL host
- Ensure the database user has proper privileges

### Permission Errors
- Make sure the database user has ALL PRIVILEGES on the database
- Check if your hosting provider has specific MySQL restrictions

### SSL Issues
- Most cPanel hosting doesn't require SSL for local MySQL connections
- Keep `DB_SSL=false` unless your hosting provider specifically requires it

### Character Encoding
- The scripts use `utf8mb4` encoding for proper Unicode support
- Ensure your database is created with `utf8mb4_unicode_ci` collation

## Support

If you encounter issues:
1. Check your hosting provider's MySQL documentation
2. Contact your hosting provider's support for database connection details
3. Verify all environment variables are correctly set
4. Check the application logs for specific error messages
