import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AuthDebugPage() {
  const supabase = createClient()

  // Check if we can query the users table
  const { data: publicUsers, error: publicError } = await supabase.from("users").select("*").limit(10)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Authentication Debug</h1>

      <Card>
        <CardHeader>
          <CardTitle>Public Users Table</CardTitle>
          <CardDescription>Users in the public.users table</CardDescription>
        </CardHeader>
        <CardContent>
          {publicError ? (
            <div className="text-red-600">
              <p>Error: {publicError.message}</p>
            </div>
          ) : (
            <div>
              <p>Found {publicUsers?.length || 0} users</p>
              {publicUsers && publicUsers.length > 0 && (
                <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-auto">
                  {JSON.stringify(publicUsers, null, 2)}
                </pre>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Super Admin Setup Instructions</CardTitle>
          <CardDescription>Follow these steps to create your super admin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Step 1: Create User in Supabase Dashboard</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Go to your Supabase Dashboard → Authentication → Users</li>
              <li>Click "Add user"</li>
              <li>
                Email: <code className="bg-gray-100 px-1 rounded">admin@yourplatform.com</code>
              </li>
              <li>Password: Create a secure password</li>
              <li>Click "Create user"</li>
              <li>Copy the User ID (UUID) from the users list</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Step 2: Run SQL Script</h3>
            <p className="text-sm">
              Replace YOUR_AUTH_USER_ID_HERE in script 5 with the UUID you copied, then run the script.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Step 3: Verify Setup</h3>
            <p className="text-sm">Refresh this page to see if the user appears in the public.users table above.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
