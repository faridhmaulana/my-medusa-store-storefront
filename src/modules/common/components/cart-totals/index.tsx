"use client"

import { convertToLocale } from "@lib/util/money"
import { getVariantPointConfig, VariantPointConfig } from "@lib/data/coins"
import { HttpTypes } from "@medusajs/types"
import React, { useEffect, useState } from "react"

type CartTotalsProps = {
  totals: {
    total?: number | null
    subtotal?: number | null
    tax_total?: number | null
    currency_code: string
    item_subtotal?: number | null
    shipping_subtotal?: number | null
    discount_subtotal?: number | null
    metadata?: Record<string, any> | null
    items?: HttpTypes.StoreCartLineItem[]
  }
}

const CartTotals: React.FC<CartTotalsProps> = ({ totals }) => {
  const {
    currency_code,
    total,
    tax_total,
    item_subtotal,
    shipping_subtotal,
    discount_subtotal,
    metadata,
    items,
  } = totals

  const pointsCost = metadata?.points_cost as number | undefined

  const [pointConfigs, setPointConfigs] = useState<
    Record<string, VariantPointConfig | null>
  >({})

  useEffect(() => {
    if (!items?.length) return

    const variantIds = items
      .map((item) => item.variant_id || item.variant?.id)
      .filter(Boolean) as string[]

    const uniqueIds = [...new Set(variantIds)]

    Promise.all(
      uniqueIds.map((id) =>
        getVariantPointConfig(id)
          .then((config) => [id, config] as const)
          .catch(() => [id, null] as const)
      )
    ).then((results) => {
      const map: Record<string, VariantPointConfig | null> = {}
      for (const [id, config] of results) {
        map[id] = config
      }
      setPointConfigs(map)
    })
  }, [items])

  // Separate coin-only items from currency items
  let coinOnlySubtotal = 0
  let coinItemsCurrencyTotal = 0

  if (items?.length && Object.keys(pointConfigs).length > 0) {
    for (const item of items) {
      const vid = item.variant_id || item.variant?.id || ""
      const config = pointConfigs[vid] ?? null
      if (config?.payment_type === "points" && config.point_price != null) {
        coinOnlySubtotal += config.point_price * item.quantity
        coinItemsCurrencyTotal += item.total ?? 0
      }
    }
  }

  const hasCoinOnlyItems = coinOnlySubtotal > 0
  const currencySubtotal = (item_subtotal ?? 0) - coinItemsCurrencyTotal
  const adjustedTotal = (total ?? 0) - coinItemsCurrencyTotal

  return (
    <div>
      <div className="flex flex-col gap-y-2 txt-medium text-ui-fg-subtle ">
        <div className="flex items-center justify-between">
          <span>Subtotal (excl. shipping and taxes)</span>
          <div className="flex flex-col items-end">
            {currencySubtotal > 0 && (
              <span data-testid="cart-subtotal" data-value={currencySubtotal}>
                {convertToLocale({
                  amount: currencySubtotal,
                  currency_code,
                })}
              </span>
            )}
            {hasCoinOnlyItems && (
              <span className="text-amber-600 font-semibold">
                {coinOnlySubtotal.toLocaleString()} Coins
              </span>
            )}
            {!currencySubtotal && !hasCoinOnlyItems && (
              <span data-testid="cart-subtotal" data-value={0}>
                {convertToLocale({ amount: 0, currency_code })}
              </span>
            )}
          </div>
        </div>
        {currencySubtotal > 0 && (
          <div className="flex items-center justify-between">
            <span>Shipping</span>
            <span
              data-testid="cart-shipping"
              data-value={shipping_subtotal || 0}
            >
              {convertToLocale({
                amount: shipping_subtotal ?? 0,
                currency_code,
              })}
            </span>
          </div>
        )}
        {!!discount_subtotal && (
          <div className="flex items-center justify-between">
            <span>Discount</span>
            <span
              className="text-ui-fg-interactive"
              data-testid="cart-discount"
              data-value={discount_subtotal || 0}
            >
              -{" "}
              {convertToLocale({
                amount: discount_subtotal ?? 0,
                currency_code,
              })}
            </span>
          </div>
        )}
        {!!pointsCost && (
          <div className="flex items-center justify-between">
            <span>Coins Applied</span>
            <span
              className="text-amber-600 font-semibold"
              data-testid="cart-coins"
              data-value={pointsCost}
            >
              {pointsCost.toLocaleString()} Coins
            </span>
          </div>
        )}
        {currencySubtotal > 0 && (
          <div className="flex justify-between">
            <span className="flex gap-x-1 items-center ">Taxes</span>
            <span data-testid="cart-taxes" data-value={tax_total || 0}>
              {convertToLocale({ amount: tax_total ?? 0, currency_code })}
            </span>
          </div>
        )}
      </div>
      <div className="h-px w-full border-b border-gray-200 my-4" />
      <div className="flex items-center justify-between text-ui-fg-base mb-2 txt-medium ">
        <span>Total</span>
        <div className="flex flex-col items-end">
          {adjustedTotal > 0 && (
            <span
              className="txt-xlarge-plus"
              data-testid="cart-total"
              data-value={adjustedTotal}
            >
              {convertToLocale({ amount: adjustedTotal, currency_code })}
            </span>
          )}
          {hasCoinOnlyItems && (
            <span className="txt-xlarge-plus text-amber-600">
              {coinOnlySubtotal.toLocaleString()} Coins
            </span>
          )}
          {adjustedTotal <= 0 && !hasCoinOnlyItems && (
            <span
              className="txt-xlarge-plus"
              data-testid="cart-total"
              data-value={0}
            >
              {convertToLocale({ amount: 0, currency_code })}
            </span>
          )}
        </div>
      </div>
      <div className="h-px w-full border-b border-gray-200 mt-4" />
    </div>
  )
}

export default CartTotals
