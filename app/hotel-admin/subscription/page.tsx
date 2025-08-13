import { requireHotelAccess } from "@/lib/auth/server"
import SubscriptionStatus from "@/components/hotel-admin/subscription-status"

export default async function SubscriptionPage() {
  await requireHotelAccess()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Subscription & Billing</h1>
          <p className="text-gray-600">Manage your subscription plan and monitor usage</p>
        </div>

        <SubscriptionStatus />
      </div>
    </div>
  )
}
