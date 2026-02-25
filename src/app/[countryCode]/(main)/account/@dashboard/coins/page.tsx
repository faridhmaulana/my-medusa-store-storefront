import { Metadata } from "next"
import { notFound } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"
import { getCustomerCoins } from "@lib/data/coins"
import CoinHistory from "@modules/account/components/coin-history"

export const metadata: Metadata = {
  title: "Coins",
  description: "View your coin balance and transaction history.",
}

export default async function CoinsPage() {
  const customer = await retrieveCustomer().catch(() => null)

  if (!customer) {
    notFound()
  }

  const coinsData = await getCustomerCoins().catch(() => null)

  return (
    <CoinHistory
      balance={coinsData?.coins ?? 0}
      transactions={coinsData?.transactions ?? []}
    />
  )
}
