import { clx } from "@medusajs/ui"

import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import { VariantPointConfig } from "@lib/data/coins"

export default function ProductPrice({
  product,
  variant,
  pointConfig,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  pointConfig?: VariantPointConfig | null
}) {
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice

  if (!selectedPrice) {
    return <div className="block w-32 h-9 bg-gray-100 animate-pulse" />
  }

  const showCoinPrice =
    pointConfig &&
    pointConfig.payment_type !== "currency" &&
    pointConfig.point_price != null

  const coinOnly = pointConfig?.payment_type === "points"

  return (
    <div className="flex flex-col text-ui-fg-base">
      {!coinOnly && (
        <span
          className={clx("text-xl-semi", {
            "text-ui-fg-interactive": selectedPrice.price_type === "sale",
          })}
        >
          {!variant && "From "}
          <span
            data-testid="product-price"
            data-value={selectedPrice.calculated_price_number}
          >
            {selectedPrice.calculated_price}
          </span>
        </span>
      )}
      {selectedPrice.price_type === "sale" && !coinOnly && (
        <>
          <p>
            <span className="text-ui-fg-subtle">Original: </span>
            <span
              className="line-through"
              data-testid="original-product-price"
              data-value={selectedPrice.original_price_number}
            >
              {selectedPrice.original_price}
            </span>
          </p>
          <span className="text-ui-fg-interactive">
            -{selectedPrice.percentage_diff}%
          </span>
        </>
      )}
      {showCoinPrice && (
        <span
          className="text-xl-semi text-amber-600"
          data-testid="product-coin-price"
          data-value={pointConfig.point_price}
        >
          {coinOnly
            ? `${pointConfig.point_price!.toLocaleString()} Coins`
            : `or ${pointConfig.point_price!.toLocaleString()} Coins`}
        </span>
      )}
    </div>
  )
}
