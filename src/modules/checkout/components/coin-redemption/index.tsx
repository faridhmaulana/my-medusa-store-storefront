"use client"

import { redeemCoinsOnCart, removeCoinsFromCart } from "@lib/data/coins"
import { Button, Text } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import { useCoinSelection } from "@modules/checkout/context/coin-selection-context"
import { useState } from "react"

type CoinRedemptionProps = {
  cart: any
  coinBalance: number | null
}

const CoinRedemption = ({ cart, coinBalance }: CoinRedemptionProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { getSelectedVariantIds, clearSelections } = useCoinSelection()

  const isRedeemed = !!cart?.metadata?.points_cost
  const pointsCost = cart?.metadata?.points_cost as number | undefined

  if (coinBalance === null) {
    return null
  }

  const handleRedeem = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const selectedIds = getSelectedVariantIds()
      // Always send the array (empty or with IDs) for explicit selection
      await redeemCoinsOnCart(cart.id, selectedIds)
    } catch (err: any) {
      setError(err.message || "Failed to redeem coins")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemove = async () => {
    setIsRemoving(true)
    setError(null)

    try {
      await removeCoinsFromCart(cart.id)
      clearSelections()
    } catch (err: any) {
      setError(err.message || "Failed to remove coins")
    } finally {
      setIsRemoving(false)
    }
  }

  if (isRedeemed) {
    return (
      <div className="flex flex-col gap-y-2 p-4 bg-amber-50 rounded-lg border border-amber-200">
        <div className="flex items-center justify-between">
          <Text className="txt-medium-plus text-amber-800 font-semibold">
            Coins Applied
          </Text>
          <Text className="txt-medium-plus text-amber-800 font-semibold">
            {pointsCost?.toLocaleString()} Coins
          </Text>
        </div>
        <div className="flex items-center justify-between">
          <Text className="txt-small text-amber-700">
            Your coins will be deducted when the order is placed.
          </Text>
          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="txt-small text-red-600 hover:text-red-800 underline disabled:opacity-50"
          >
            {isRemoving ? "Removing..." : "Remove"}
          </button>
        </div>
        <ErrorMessage error={error} data-testid="coin-remove-error" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex items-center justify-between">
        <Text className="txt-medium text-ui-fg-subtle">Coin Balance</Text>
        <Text className="txt-medium font-semibold text-amber-600">
          {coinBalance.toLocaleString()} Coins
        </Text>
      </div>
      <Text className="txt-small text-ui-fg-muted">
        Select items above to pay with coins, then click Use Coins.
      </Text>
      <Button
        variant="secondary"
        className="w-full"
        onClick={handleRedeem}
        isLoading={isLoading}
        disabled={coinBalance <= 0}
      >
        Use Coins
      </Button>
      <ErrorMessage error={error} data-testid="coin-redemption-error" />
    </div>
  )
}

export default CoinRedemption
