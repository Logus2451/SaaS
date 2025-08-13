import { Suspense } from "react"
import { GuestManagement } from "@/components/hotel-admin/guest-management"

export default function GuestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Guest Management</h1>
        <p className="text-gray-600">Manage your hotel guests and their preferences</p>
      </div>

      <Suspense fallback={<div>Loading guests...</div>}>
        <GuestManagement />
      </Suspense>
    </div>
  )
}
