"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase/client"
import { DollarSign, TrendingUp, AlertCircle, CheckCircle, Send } from "lucide-react"
import SubscriptionManagement from "./subscription-management"

interface BillingRecord {
  id: string
  hotel_id: string
  hotel_name: string
  amount: number
  plan_name: string
  status: string
  due_date: string
  paid_date?: string
  billing_period_start: string
  billing_period_end: string
}

export default function BillingOverview() {
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBillingRecords()
  }, [])

  const loadBillingRecords = async () => {
    try {
      const { data } = await supabase
        .from("billing_records")
        .select(`
          *,
          hotels!inner(name)
        `)
        .order("created_at", { ascending: false })
        .limit(50)

      const formattedData =
        data?.map((record) => ({
          ...record,
          hotel_name: record.hotels.name,
        })) || []

      setBillingRecords(formattedData)
    } catch (error) {
      console.error("Error loading billing records:", error)
    } finally {
      setLoading(false)
    }
  }

  const sendPaymentReminder = async (recordId: string) => {
    try {
      // In a real app, this would send an email reminder
      console.log("Sending payment reminder for record:", recordId)

      // Update the record to mark reminder sent
      await supabase.from("billing_records").update({ reminder_sent: true }).eq("id", recordId)

      loadBillingRecords()
    } catch (error) {
      console.error("Error sending reminder:", error)
    }
  }

  const markAsPaid = async (recordId: string) => {
    try {
      await supabase
        .from("billing_records")
        .update({
          status: "paid",
          paid_date: new Date().toISOString(),
        })
        .eq("id", recordId)

      loadBillingRecords()
    } catch (error) {
      console.error("Error marking as paid:", error)
    }
  }

  const totalRevenue = billingRecords
    .filter((record) => record.status === "paid")
    .reduce((sum, record) => sum + record.amount, 0)

  const pendingAmount = billingRecords
    .filter((record) => record.status === "pending")
    .reduce((sum, record) => sum + record.amount, 0)

  const overdueAmount = billingRecords
    .filter((record) => record.status === "overdue")
    .reduce((sum, record) => sum + record.amount, 0)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Paid
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "overdue":
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Overdue
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>
  }

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList>
        <TabsTrigger value="overview">Billing Overview</TabsTrigger>
        <TabsTrigger value="subscriptions">Subscription Management</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        {/* Billing Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${pendingAmount.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {billingRecords.filter((record) => record.status === "pending").length} invoices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${overdueAmount.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {billingRecords.filter((record) => record.status === "overdue").length} overdue invoices
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Billing Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Billing Activity</CardTitle>
            <CardDescription>Overview of all hotel subscriptions and payments</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hotel</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billingRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.hotel_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{record.plan_name}</Badge>
                    </TableCell>
                    <TableCell>${record.amount.toFixed(2)}</TableCell>
                    <TableCell>{new Date(record.due_date).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          View Invoice
                        </Button>
                        {record.status === "pending" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => sendPaymentReminder(record.id)}>
                              <Send className="h-3 w-3 mr-1" />
                              Remind
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => markAsPaid(record.id)}>
                              Mark Paid
                            </Button>
                          </>
                        )}
                        {record.status === "overdue" && (
                          <Button size="sm" variant="destructive" onClick={() => markAsPaid(record.id)}>
                            Mark Paid
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="subscriptions">
        <SubscriptionManagement />
      </TabsContent>
    </Tabs>
  )
}
