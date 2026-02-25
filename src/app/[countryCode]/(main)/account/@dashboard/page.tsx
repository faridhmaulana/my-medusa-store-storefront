import { Metadata } from "next"

import Overview from "@modules/account/components/overview"
import { notFound } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"
import { listOrders } from "@lib/data/orders"
import { getCustomerCoins } from "@lib/data/coins"

export const metadata: Metadata = {
  title: "Account",
  description: "Overview of your account activity.",
}

export default async function OverviewTemplate() {
  const customer = await retrieveCustomer().catch(() => null)
  const [orders, coinsData] = await Promise.all([
    listOrders().catch(() => null),
    getCustomerCoins().catch(() => null),
  ])

  if (!customer) {
    notFound()
  }

  return (
    <Overview
      customer={customer}
      orders={orders || null}
      coinBalance={coinsData?.coins ?? 0}
    />
  )
}
