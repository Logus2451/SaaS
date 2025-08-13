import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { userQueries } from "@/lib/database/queries"
import { v4 as uuidv4 } from "uuid"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"
const JWT_EXPIRES_IN = "7d"

export interface AuthUser {
  id: string
  email: string
  full_name: string | null
  role: "super_admin" | "hotel_owner" | "hotel_staff" | "guest"
  hotel_id: string | null
}

export interface LoginResult {
  success: boolean
  user?: AuthUser
  token?: string
  error?: string
}

export interface SignUpResult {
  success: boolean
  user?: AuthUser
  error?: string
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Generate JWT token
export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      hotel_id: user.hotel_id,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  )
}

// Verify JWT token
export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return {
      id: decoded.id,
      email: decoded.email,
      full_name: decoded.full_name,
      role: decoded.role,
      hotel_id: decoded.hotel_id,
    }
  } catch {
    return null
  }
}

// Login user
export async function loginUser(email: string, password: string): Promise<LoginResult> {
  try {
    // Find user by email
    const user = await userQueries.findByEmail(email)
    if (!user) {
      return { success: false, error: "Invalid email or password" }
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash)
    if (!isValidPassword) {
      return { success: false, error: "Invalid email or password" }
    }

    // Check if email is verified
    if (!user.email_verified) {
      return { success: false, error: "Please verify your email address before signing in" }
    }

    // Create auth user object
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      hotel_id: user.hotel_id,
    }

    // Generate token
    const token = generateToken(authUser)

    return { success: true, user: authUser, token }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Sign up user
export async function signUpUser(
  email: string,
  password: string,
  fullName: string,
  role: "hotel_owner" | "guest" = "hotel_owner",
): Promise<SignUpResult> {
  try {
    // Check if user already exists
    const existingUser = await userQueries.findByEmail(email)
    if (existingUser) {
      return { success: false, error: "An account with this email already exists" }
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const userId = await userQueries.create({
      email,
      password_hash: hashedPassword,
      full_name: fullName,
      role,
      hotel_id: null,
      email_verified: false, // In production, send verification email
      reset_token: null,
      reset_token_expires: null,
    })

    // Create auth user object
    const authUser: AuthUser = {
      id: userId,
      email,
      full_name: fullName,
      role,
      hotel_id: null,
    }

    return { success: true, user: authUser }
  } catch (error) {
    console.error("Sign up error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Generate password reset token
export async function generateResetToken(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await userQueries.findByEmail(email)
    if (!user) {
      // Don't reveal if email exists or not
      return { success: true }
    }

    const resetToken = uuidv4()
    const resetTokenExpires = new Date(Date.now() + 3600000) // 1 hour

    await userQueries.update(user.id, {
      reset_token: resetToken,
      reset_token_expires: resetTokenExpires,
    })

    // In production, send email with reset link
    console.log(`Password reset token for ${email}: ${resetToken}`)

    return { success: true }
  } catch (error) {
    console.error("Reset token error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Reset password
export async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const users = await userQueries.findByResetToken(token)
    if (!users || users.reset_token_expires! < new Date()) {
      return { success: false, error: "Invalid or expired reset token" }
    }

    const hashedPassword = await hashPassword(newPassword)

    await userQueries.update(users.id, {
      password_hash: hashedPassword,
      reset_token: null,
      reset_token_expires: null,
    })

    return { success: true }
  } catch (error) {
    console.error("Reset password error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
