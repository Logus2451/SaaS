export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  interval: "monthly" | "yearly"
  features: string[]
  limits: {
    maxRooms: number
    maxBookings: number
    maxStaff: number
    analyticsRetention: number // days
    supportLevel: "basic" | "priority" | "dedicated"
  }
  popular?: boolean
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    interval: "monthly",
    features: ["Up to 5 rooms", "Basic booking management", "Email support", "7-day analytics retention"],
    limits: {
      maxRooms: 5,
      maxBookings: 50,
      maxStaff: 1,
      analyticsRetention: 7,
      supportLevel: "basic",
    },
  },
  {
    id: "starter",
    name: "Starter",
    price: 29,
    interval: "monthly",
    features: [
      "Up to 25 rooms",
      "Advanced booking management",
      "Calendar integration",
      "Email & chat support",
      "30-day analytics retention",
      "Custom branding",
    ],
    limits: {
      maxRooms: 25,
      maxBookings: 500,
      maxStaff: 3,
      analyticsRetention: 30,
      supportLevel: "priority",
    },
  },
  {
    id: "pro",
    name: "Pro",
    price: 99,
    interval: "monthly",
    popular: true,
    features: [
      "Up to 100 rooms",
      "Full booking management suite",
      "Advanced analytics & reporting",
      "API access",
      "Priority support",
      "90-day analytics retention",
      "Multi-staff management",
      "Custom integrations",
    ],
    limits: {
      maxRooms: 100,
      maxBookings: 2000,
      maxStaff: 10,
      analyticsRetention: 90,
      supportLevel: "priority",
    },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 299,
    interval: "monthly",
    features: [
      "Unlimited rooms",
      "Enterprise booking management",
      "Advanced analytics & custom reports",
      "Full API access",
      "Dedicated support manager",
      "Unlimited analytics retention",
      "Unlimited staff",
      "Custom integrations",
      "White-label solution",
      "SLA guarantee",
    ],
    limits: {
      maxRooms: -1, // unlimited
      maxBookings: -1, // unlimited
      maxStaff: -1, // unlimited
      analyticsRetention: -1, // unlimited
      supportLevel: "dedicated",
    },
  },
]

export function getPlanById(planId: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === planId)
}

export function canExceedLimit(
  currentPlan: string,
  limitType: keyof SubscriptionPlan["limits"],
  currentUsage: number,
): boolean {
  const plan = getPlanById(currentPlan)
  if (!plan) return false

  const limit = plan.limits[limitType]
  if (limit === -1) return true // unlimited

  return currentUsage < (limit as number)
}
