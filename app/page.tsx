import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Building2, Users, Calendar, CreditCard } from "lucide-react"

export default async function HomePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is logged in, redirect based on role
  if (user) {
    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (userData?.role === "super_admin") {
      redirect("/super-admin")
    } else if (userData?.role === "hotel_owner") {
      redirect("/hotel-admin")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">HotelSaaS</h1>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Complete Hotel Booking
            <span className="text-blue-600"> Management Platform</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Streamline your hotel operations with our comprehensive SaaS platform. Manage bookings, rooms, and guests
            all in one place.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <Button size="lg" asChild>
              <Link href="/auth/signup">Start Free Trial</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <Building2 className="h-8 w-8 text-blue-600" />
                <CardTitle>Multi-Tenant</CardTitle>
                <CardDescription>Separate hotel instances with custom domains and branding</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Calendar className="h-8 w-8 text-green-600" />
                <CardTitle>Smart Calendar</CardTitle>
                <CardDescription>Advanced booking calendar with availability management</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-purple-600" />
                <CardTitle>Guest Management</CardTitle>
                <CardDescription>Complete CRM for managing guest relationships and bookings</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CreditCard className="h-8 w-8 text-orange-600" />
                <CardTitle>Billing & Analytics</CardTitle>
                <CardDescription>Comprehensive reporting and subscription management</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Pricing */}
        <div className="mt-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Simple, Transparent Pricing</h2>
            <p className="mt-4 text-lg text-gray-600">Choose the plan that fits your hotel's needs</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Free", price: "$0", features: ["Up to 10 rooms", "Basic booking", "Email support"] },
              {
                name: "Starter",
                price: "$29",
                features: ["Up to 50 rooms", "Advanced calendar", "Phone support", "Basic reports"],
              },
              {
                name: "Pro",
                price: "$99",
                features: ["Up to 200 rooms", "Custom branding", "API access", "Advanced analytics"],
              },
              {
                name: "Enterprise",
                price: "Custom",
                features: ["Unlimited rooms", "White-label", "Dedicated support", "Custom integrations"],
              },
            ].map((plan) => (
              <Card key={plan.name} className="relative">
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">
                    {plan.price}
                    <span className="text-sm font-normal">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="text-sm text-gray-600">
                        ✓ {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-6" variant={plan.name === "Pro" ? "default" : "outline"}>
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
