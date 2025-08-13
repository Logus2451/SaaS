"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2, Database, Key, Shield } from "lucide-react"

export default function SuperAdminSetup() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <Building2 className="mx-auto h-16 w-16 text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Super Admin Setup</h1>
          <p className="text-gray-600 mt-2">Platform Owner Account Configuration</p>
        </div>

        <div className="space-y-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> This setup is only for the platform owner (you). Complete these steps to
              create your super admin account.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Step 1: Create Auth User in Supabase Dashboard
              </CardTitle>
              <CardDescription>Create your authentication account through the Supabase Dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Instructions:</h4>
                <ol className="text-sm text-blue-800 space-y-2">
                  <li>1. Go to your Supabase Dashboard → Authentication → Users</li>
                  <li>2. Click "Add user" button</li>
                  <li>
                    3. Fill in your details:
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>
                        • Email: <code>your-email@domain.com</code>
                      </li>
                      <li>• Password: Create a secure password</li>
                      <li>• Email Confirm: ✓ Check this box</li>
                    </ul>
                  </li>
                  <li>4. Click "Create user"</li>
                  <li>
                    5. <strong>Copy the User ID (UUID)</strong> from the users list
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Step 2: Run Super Admin Setup Script
              </CardTitle>
              <CardDescription>Execute the SQL script to create your super admin profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-amber-50 p-4 rounded-lg mb-4">
                <p className="text-amber-800 text-sm">
                  <strong>Before running:</strong> Replace the placeholders in{" "}
                  <code>scripts/05_create_super_admin.sql</code> with your actual values:
                </p>
                <ul className="text-amber-700 text-sm mt-2 space-y-1">
                  <li>
                    • Replace <code>YOUR_AUTH_USER_ID_HERE</code> with the UUID you copied
                  </li>
                  <li>
                    • Replace <code>admin@yourplatform.com</code> with your email
                  </li>
                </ul>
              </div>

              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                <p className="text-green-400 text-sm mb-2">Run this in Supabase SQL Editor:</p>
                <code className="text-gray-300">scripts/05_create_super_admin.sql</code>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Step 3: Login to Your Platform
              </CardTitle>
              <CardDescription>Access your super admin dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Login URL</h3>
                  <code className="text-blue-700">/auth/login</code>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">Super Admin Dashboard</h3>
                  <code className="text-green-700">/super-admin</code>
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  Use the email and password you created in Supabase Dashboard. You'll be automatically redirected to
                  the super admin dashboard after login.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What You Can Do as Super Admin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Hotel Management</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Onboard new hotels</li>
                    <li>• Manage hotel subscriptions</li>
                    <li>• View all hotel data</li>
                    <li>• Suspend/activate hotels</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Billing & Analytics</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Track subscription revenue</li>
                    <li>• Manage billing cycles</li>
                    <li>• View platform analytics</li>
                    <li>• Generate reports</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
