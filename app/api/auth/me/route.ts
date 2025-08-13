import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"

export async function GET() {
  try {
    const user = getCurrentUser()

    if (!user) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Get current user API error:", error)
    return NextResponse.json({ user: null })
  }
}
