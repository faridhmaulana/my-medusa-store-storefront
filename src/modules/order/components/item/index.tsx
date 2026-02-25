"use client"

import { getVariantPointConfig, VariantPointConfig } from "@lib/data/coins"
import { HttpTypes } from "@medusajs/types"
import { Table, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import Thumbnail from "@modules/products/components/thumbnail"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  currencyCode: string
}

const Item = ({ item, currencyCode }: ItemProps) => {
  const [pointConfig, setPointConfig] = useState<VariantPointConfig | null>(
    null
  )

  const variantId =
    (item as any).variant_id || (item as any).variant?.id || null

  useEffect(() => {
    if (!variantId) return

    getVariantPointConfig(variantId)
      .then((config) => setPointConfig(config))
      .catch(() => setPointConfig(null))
  }, [variantId])

  return (
    <Table.Row className="w-full" data-testid="product-row">
      <Table.Cell className="!pl-0 p-4 w-24">
        <div className="flex w-16">
          <Thumbnail thumbnail={item.thumbnail} size="square" />
        </div>
      </Table.Cell>

      <Table.Cell className="text-left">
        <Text
          className="txt-medium-plus text-ui-fg-base"
          data-testid="product-name"
        >
          {item.product_title}
        </Text>
        <LineItemOptions variant={item.variant} data-testid="product-variant" />
      </Table.Cell>

      <Table.Cell className="!pr-0">
        <span className="!pr-0 flex flex-col items-end h-full justify-center">
          <span className="flex gap-x-1 ">
            <Text className="text-ui-fg-muted">
              <span data-testid="product-quantity">{item.quantity}</span>x{" "}
            </Text>
            <LineItemUnitPrice
              item={item}
              style="tight"
              currencyCode={currencyCode}
              pointConfig={pointConfig}
            />
          </span>

          <LineItemPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
            pointConfig={pointConfig}
          />
        </span>
      </Table.Cell>
    </Table.Row>
  )
}

export default Item
