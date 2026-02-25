import { Text } from "@medusajs/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { getVariantPointConfig } from "@lib/data/coins"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  const firstVariant = product.variants?.[0]
  const pointConfig = firstVariant
    ? await getVariantPointConfig(firstVariant.id).catch(() => null)
    : null

  const showCoinPrice =
    pointConfig &&
    pointConfig.payment_type !== "currency" &&
    pointConfig.point_price != null

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group">
      <div data-testid="product-wrapper">
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
        />
        <div className="flex txt-compact-medium mt-4 justify-between">
          <Text className="text-ui-fg-subtle" data-testid="product-title">
            {product.title}
          </Text>
          <div className="flex items-center gap-x-2">
            {showCoinPrice && (
              <Text className="text-amber-600 txt-compact-medium font-semibold">
                {pointConfig.point_price!.toLocaleString()} Coins
              </Text>
            )}
            {cheapestPrice && pointConfig?.payment_type !== "points" && (
              <PreviewPrice price={cheapestPrice} />
            )}
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
