"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"
import { Building2 } from "lucide-react"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      console.log("🔐 Attempting login with:", { email, passwordLength: password.length })

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("❌ Supabase auth error:", {
          message: error.message,
          status: error.status,
          name: error.name,
          cause: error.cause,
        })

        if (error.message === "Invalid login credentials") {
          setError("Invalid email or password. Please check your credentials and try again.")
        } else if (error.message.includes("Email not confirmed")) {
          setError("Please confirm your email address before signing in.")
        } else {
          setError(`Login failed: ${error.message}`)
        }
        return
      }

      if (data.user) {
        console.log("✅ Auth successful, user:", {
          id: data.user.id,
          email: data.user.email,
          emailConfirmed: data.user.email_confirmed_at,
          lastSignIn: data.user.last_sign_in_at,
        })

        // Get user role to redirect appropriately
        console.log("🔍 Looking up user role in public.users table...")
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("role, email, full_name")
          .eq("id", data.user.id)
          .single()

        if (userError) {
          console.error("❌ User lookup error:", userError)
          console.log("💡 This usually means the user exists in auth.users but not in public.users")
          setError("User profile not found. Please contact support or check if your account setup is complete.")
          return
        }

        console.log("✅ User profile found:", userData)

        if (userData?.role === "super_admin") {
          console.log("🚀 Redirecting to super admin dashboard")
          router.push("/super-admin")
        } else if (userData?.role === "hotel_owner") {
          console.log("🚀 Redirecting to hotel admin dashboard")
          router.push("/hotel-admin")
        } else {
          console.log("🚀 Redirecting to home page")
          router.push("/")
        }
      }
    } catch (err) {
      console.error("💥 Unexpected error:", err)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <Building2 className="mx-auto h-12 w-12 text-blue-600" />
        <h2 className="mt-6 text-3xl font-bold text-gray-900">Sign in to your account</h2>
        <p className="mt-2 text-sm text-gray-600">
          Or{" "}
          <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">
            create a new account
          </Link>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/debug/auth-status" className="text-sm text-blue-600 hover:text-blue-500">
              Debug Authentication Issues
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
