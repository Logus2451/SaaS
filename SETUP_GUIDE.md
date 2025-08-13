# Hotel Booking SaaS Platform - Complete Setup Guide

## Project Overview

This is a comprehensive multi-tenant SaaS hotel booking management platform built with Next.js 14, TypeScript, and MySQL. The platform supports three main user types:

- **Super Admin**: Platform owner who onboards hotels and manages billing
- **Hotel Owners**: Manage their hotel properties, rooms, and bookings
- **End Users**: Book rooms at various hotels

## Architecture

### Tech Stack
- **Frontend**: Next.js 14 with App Router, React, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Database**: MySQL (migrated from Supabase)
- **Authentication**: Custom JWT-based auth with bcrypt password hashing
- **Deployment**: Vercel (recommended) or any Node.js hosting

### Key Features
- Multi-tenant architecture with data isolation
- Role-based access control (RBAC)
- Subscription billing system (Free, Starter, Pro, Enterprise)
- Advanced calendar view for room management
- Guest CRM system for hotel owners
- Comprehensive booking management
- Real-time availability checking

## Database Migration Summary

**Original**: Supabase (PostgreSQL + Auth)
**Current**: MySQL with custom authentication

### Key Changes Made:
1. **Database Connection**: Replaced Supabase client with mysql2 connection pool
2. **Authentication**: Custom JWT-based auth system replacing Supabase Auth
3. **Database Schema**: Converted PostgreSQL scripts to MySQL syntax
4. **API Routes**: Updated all routes to use MySQL queries
5. **Environment Variables**: Updated for MySQL configuration

## Setup Instructions

### 1. Prerequisites
- Node.js 18+ installed
- MySQL database (cPanel hosting or local)
- Code editor (VS Code recommended)

### 2. Environment Configuration

Create `.env.local` file in the root directory:

\`\`\`env
# Database Configuration (cPanel MySQL)
DB_HOST=your-cpanel-mysql-host
DB_USER=your-mysql-username
DB_PASSWORD=your-mysql-password
DB_NAME=your-database-name
DB_PORT=3306
DB_SSL=false

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRES_IN=7d

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### 3. cPanel MySQL Database Setup

#### Step 1: Create Database
1. Login to your cPanel
2. Go to "MySQL Databases"
3. Create a new database (e.g., `hotel_booking_saas`)
4. Create a MySQL user with full privileges
5. Note down the connection details

#### Step 2: Get Connection Details
- **Host**: Usually `localhost` or your domain
- **Port**: Usually `3306`
- **Database Name**: The database you created
- **Username/Password**: The MySQL user credentials

### 4. Database Schema Setup

Run these SQL scripts in order using cPanel phpMyAdmin or MySQL command line:

#### Script 1: Create Tables
\`\`\`bash
# Run: scripts/mysql/01_create_tables.sql
\`\`\`
Creates all database tables with proper relationships and constraints.

#### Script 2: Create Functions
\`\`\`bash
# Run: scripts/mysql/02_create_functions.sql
\`\`\`
Creates stored procedures and triggers for business logic.

#### Script 3: Seed Data
\`\`\`bash
# Run: scripts/mysql/03_seed_data.sql
\`\`\`
Inserts initial subscription plans and sample data.

### 5. Super Admin Setup

#### Option 1: Through Application (Recommended)
1. Start the application: `npm run dev`
2. Go to `/auth/signup`
3. Sign up with your admin email
4. Run this SQL command to upgrade your account:

\`\`\`sql
UPDATE users 
SET role = 'super_admin' 
WHERE email = 'your-admin-email@domain.com';
\`\`\`

#### Option 2: Direct SQL Creation
\`\`\`bash
# Run: scripts/mysql/04_create_super_admin.sql
# (Update the email in the script first)
\`\`\`

### 6. Local Development

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
http://localhost:3000
\`\`\`

### 7. Application URLs

- **Landing Page**: `/`
- **Authentication**: `/auth/login`, `/auth/signup`
- **Super Admin**: `/super-admin` (after login as super admin)
- **Hotel Admin**: `/hotel-admin` (after login as hotel owner)
- **Hotel Booking**: `/hotels` (public booking interface)
- **Individual Hotel**: `/hotels/[slug]` (hotel-specific booking)

## User Roles & Access

### Super Admin
- **Access**: `/super-admin/*`
- **Capabilities**:
  - Onboard new hotels
  - Manage subscription plans
  - View platform analytics
  - Billing management
  - Hotel status management

### Hotel Owner
- **Access**: `/hotel-admin/*`
- **Capabilities**:
  - Manage hotel profile
  - Add/edit room types and rooms
  - View booking calendar
  - Manage guest CRM
  - Generate reports
  - Handle bookings

### Hotel Staff
- **Access**: `/hotel-admin/*` (limited)
- **Capabilities**:
  - View bookings
  - Update booking status
  - Access guest information

### End User/Guest
- **Access**: `/hotels/*`, `/booking/*`
- **Capabilities**:
  - Browse hotels
  - Search availability
  - Make bookings
  - View booking history

## Database Schema Overview

### Core Tables
- `users` - All system users with roles
- `hotels` - Hotel properties
- `room_types` - Room categories (Deluxe, Suite, etc.)
- `rooms` - Individual room instances
- `bookings` - Reservation records
- `guests` - Guest profiles for CRM
- `subscription_plans` - Billing plans
- `billing_records` - Payment tracking

### Key Relationships
- Users belong to hotels (hotel_id foreign key)
- Rooms belong to room types and hotels
- Bookings link guests, rooms, and hotels
- Multi-tenant isolation via hotel_id

## Deployment

### Vercel Deployment (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Alternative Hosting
- **Requirements**: Node.js 18+, MySQL access
- **Platforms**: Railway, Render, DigitalOcean, AWS
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

## Troubleshooting

### Common Issues

#### Database Connection Errors
\`\`\`bash
# Test database connection
node -e "
const mysql = require('mysql2/promise');
mysql.createConnection({
  host: 'your-host',
  user: 'your-user',
  password: 'your-password',
  database: 'your-database'
}).then(() => console.log('Connected!')).catch(console.error);
"
\`\`\`

#### Authentication Issues
- Verify JWT_SECRET is set and at least 32 characters
- Check if user exists in database
- Verify password hashing is working

#### Build Errors
- Ensure all environment variables are set
- Check for TypeScript errors: `npm run type-check`
- Verify database connection during build

### Environment Variables Checklist
- [ ] DB_HOST
- [ ] DB_USER  
- [ ] DB_PASSWORD
- [ ] DB_NAME
- [ ] DB_PORT
- [ ] JWT_SECRET
- [ ] NEXT_PUBLIC_APP_URL

## Multi-Tenant Architecture

### URL Structure
- Super Admin: `yourdomain.com/super-admin`
- Hotel Admin: `yourdomain.com/hotel-admin` 
- Hotel Booking: `yourdomain.com/hotels/hotel-slug`

### Data Isolation
- All hotel-specific data filtered by `hotel_id`
- Role-based access control in middleware
- Secure API routes with authentication

## Subscription Plans

### Available Plans
1. **Free**: 5 rooms, basic features
2. **Starter**: 25 rooms, calendar view, reports
3. **Pro**: 100 rooms, CRM, advanced analytics
4. **Enterprise**: Unlimited, custom features

### Billing Features
- Automatic plan enforcement
- Usage tracking
- Payment history
- Plan upgrades/downgrades

## Support & Maintenance

### Regular Tasks
- Database backups
- Monitor application logs
- Update dependencies
- Security patches

### Monitoring
- Database performance
- API response times
- User authentication errors
- Booking conversion rates

## Development Notes

### Code Structure
\`\`\`
/app                 # Next.js App Router pages
/components          # Reusable React components
/lib                 # Utility functions and configurations
  /auth             # Authentication utilities
  /database         # Database connection and queries
/scripts/mysql      # Database setup scripts
/public             # Static assets
\`\`\`

### Key Files
- `middleware.ts` - Route protection and authentication
- `lib/database/connection.ts` - MySQL connection pool
- `lib/auth/auth.ts` - Authentication utilities
- `components/auth/*` - Login/signup forms

## License & Credits

This hotel booking SaaS platform was built with modern web technologies and follows industry best practices for security, scalability, and maintainability.

---

**Last Updated**: August 2025
**Version**: 1.0.0 (MySQL Migration)
