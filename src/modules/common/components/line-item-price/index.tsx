import { getPercentageDiff } from "@lib/util/get-percentage-diff"
import { convertToLocale } from "@lib/util/money"
import { VariantPointConfig } from "@lib/data/coins"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"

type LineItemPriceProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  style?: "default" | "tight"
  currencyCode: string
  pointConfig?: VariantPointConfig | null
  coinSelected?: boolean
}

const LineItemPrice = ({
  item,
  style = "default",
  currencyCode,
  pointConfig,
  coinSelected,
}: LineItemPriceProps) => {
  const originalPrice = item.original_total ?? 0
  const currentPrice = item.total ?? 0
  const hasReducedPrice = currentPrice < originalPrice
  const coinOnly = pointConfig?.payment_type === "points"
  const isBothSelectedForCoins =
    coinSelected && pointConfig?.payment_type === "both"

  if (
    (coinOnly || isBothSelectedForCoins) &&
    pointConfig?.point_price != null
  ) {
    return (
      <div className="flex flex-col gap-x-2 text-ui-fg-subtle items-end">
        <div className="text-left">
          <span
            className="text-base-regular text-amber-600 font-semibold"
            data-testid="product-price"
          >
            {(pointConfig.point_price * item.quantity).toLocaleString()} Coins
          </span>
          {isBothSelectedForCoins && (
            <span className="text-xs text-ui-fg-muted line-through block">
              {convertToLocale({
                amount: currentPrice,
                currency_code: currencyCode,
              })}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-x-2 text-ui-fg-subtle items-end">
      <div className="text-left">
        {hasReducedPrice && (
          <>
            <p>
              {style === "default" && (
                <span className="text-ui-fg-subtle">Original: </span>
              )}
              <span
                className="line-through text-ui-fg-muted"
                data-testid="product-original-price"
              >
                {convertToLocale({
                  amount: originalPrice,
                  currency_code: currencyCode,
                })}
              </span>
            </p>
            {style === "default" && (
              <span className="text-ui-fg-interactive">
                -{getPercentageDiff(originalPrice, currentPrice || 0)}%
              </span>
            )}
          </>
        )}
        <span
          className={clx("text-base-regular", {
            "text-ui-fg-interactive": hasReducedPrice,
          })}
          data-testid="product-price"
        >
          {convertToLocale({
            amount: currentPrice,
            currency_code: currencyCode,
          })}
        </span>
        {pointConfig?.payment_type === "both" &&
          pointConfig?.point_price != null && (
            <span className="text-xs text-amber-600">
              or {(pointConfig.point_price * item.quantity).toLocaleString()}{" "}
              Coins
            </span>
          )}
      </div>
    </div>
  )
}

export default LineItemPrice
