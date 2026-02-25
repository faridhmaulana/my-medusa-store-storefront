import { convertToLocale } from "@lib/util/money"
import { VariantPointConfig } from "@lib/data/coins"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"

type LineItemUnitPriceProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  style?: "default" | "tight"
  currencyCode: string
  pointConfig?: VariantPointConfig | null
}

const LineItemUnitPrice = ({
  item,
  style = "default",
  currencyCode,
  pointConfig,
}: LineItemUnitPriceProps) => {
  const total = item.total ?? 0
  const original_total = item.original_total ?? 0
  const hasReducedPrice = total < original_total
  const coinOnly = pointConfig?.payment_type === "points"

  const percentage_diff = original_total
    ? Math.round(((original_total - total) / original_total) * 100)
    : 0

  if (coinOnly && pointConfig?.point_price != null) {
    return (
      <div className="flex flex-col text-ui-fg-muted justify-center h-full">
        <span
          className="text-base-regular text-amber-600 font-semibold"
          data-testid="product-unit-price"
        >
          {pointConfig.point_price.toLocaleString()} Coins
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col text-ui-fg-muted justify-center h-full">
      {hasReducedPrice && (
        <>
          <p>
            {style === "default" && (
              <span className="text-ui-fg-muted">Original: </span>
            )}
            <span
              className="line-through"
              data-testid="product-unit-original-price"
            >
              {convertToLocale({
                amount: original_total / item.quantity,
                currency_code: currencyCode,
              })}
            </span>
          </p>
          {style === "default" && (
            <span className="text-ui-fg-interactive">-{percentage_diff}%</span>
          )}
        </>
      )}
      <span
        className={clx("text-base-regular", {
          "text-ui-fg-interactive": hasReducedPrice,
        })}
        data-testid="product-unit-price"
      >
        {convertToLocale({
          amount: total / item.quantity,
          currency_code: currencyCode,
        })}
      </span>
      {pointConfig?.payment_type === "both" &&
        pointConfig?.point_price != null && (
          <span className="text-xs text-amber-600">
            or {pointConfig.point_price.toLocaleString()} Coins
          </span>
        )}
    </div>
  )
}

export default LineItemUnitPrice
