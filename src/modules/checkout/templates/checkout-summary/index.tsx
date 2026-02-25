"use client"

import { Heading } from "@medusajs/ui"

import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import CoinRedemption from "@modules/checkout/components/coin-redemption"
import { CoinSelectionProvider } from "@modules/checkout/context/coin-selection-context"
import DiscountCode from "@modules/checkout/components/discount-code"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"

const CheckoutSummary = ({
  cart,
  coinBalance,
}: {
  cart: any
  coinBalance?: number | null
}) => {
  return (
    <CoinSelectionProvider>
      <div className="sticky top-0 flex flex-col-reverse small:flex-col gap-y-8 py-8 small:py-0 ">
        <div className="w-full bg-white flex flex-col">
          <Divider className="my-6 small:hidden" />
          <Heading
            level="h2"
            className="flex flex-row text-3xl-regular items-baseline"
          >
            In your Cart
          </Heading>
          <Divider className="my-6" />
          <CartTotals totals={cart} />
          <ItemsPreviewTemplate cart={cart} />
          <div className="my-6">
            <DiscountCode cart={cart} />
          </div>
          {coinBalance !== undefined && coinBalance !== null && (
            <div className="mb-6">
              <CoinRedemption cart={cart} coinBalance={coinBalance} />
            </div>
          )}
        </div>
      </div>
    </CoinSelectionProvider>
  )
}

export default CheckoutSummary
