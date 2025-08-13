"use client"

import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"

export default function AuthDebugPage() {
  const [email, setEmail] = useState("admin@yourplatform.com")
  const [result, setResult] = useState("")

  const checkUser = async () => {
    try {
      // Check if user exists in public.users table
      const { data: publicUser, error: publicError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single()

      if (publicError && publicError.code !== "PGRST116") {
        setResult(`Error checking public.users: ${publicError.message}`)
        return
      }

      const result = {
        publicUserExists: !!publicUser,
        publicUserData: publicUser,
        instructions: !publicUser
          ? "User not found in public.users table. Run script 5 after creating auth user."
          : "User exists in public.users. Check Supabase Dashboard for auth user.",
      }

      setResult(JSON.stringify(result, null, 2))
    } catch (error) {
      setResult(`Error: ${error}`)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Super Admin Debug Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label>Email to check:</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@yourplatform.com" />
          </div>

          <Button onClick={checkUser}>Check User Status</Button>

          {result && <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{result}</pre>}

          <div className="mt-6 p-4 bg-blue-50 rounded">
            <h3 className="font-semibold mb-2">Steps to fix login issues:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Go to Supabase Dashboard → Authentication → Users</li>
              <li>Create user with email: admin@yourplatform.com</li>
              <li>Set a secure password</li>
              <li>Copy the user UUID</li>
              <li>Update script 5 with the UUID and run it</li>
              <li>Try logging in again</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
