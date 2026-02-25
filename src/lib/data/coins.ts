"use server"

import { sdk } from "@lib/config"
import { revalidateTag } from "next/cache"
import { getAuthHeaders, getCacheOptions, getCacheTag } from "./cookies"

export type PointTransaction = {
  id: string
  customer_id: string
  type: "earn" | "spend" | "adjust"
  points: number
  reason: string | null
  reference_id: string | null
  reference_type: string | null
  created_at: string
  updated_at: string
}

export type VariantPointConfig = {
  variant_id: string
  payment_type: "currency" | "points" | "both"
  point_price: number | null
}

export async function getCustomerCoins(): Promise<{
  coins: number
  transactions: PointTransaction[]
} | null> {
  const authHeaders = await getAuthHeaders()

  if (!authHeaders || !("authorization" in authHeaders)) return null

  const next = {
    ...(await getCacheOptions("coins")),
  }

  return await sdk.client
    .fetch<{ coins: number; transactions: PointTransaction[] }>(
      `/store/customers/me/points`,
      {
        method: "GET",
        headers: authHeaders,
        next,
        cache: "force-cache",
      }
    )
    .catch((err) => {
      console.error("Failed to fetch customer coins:", err)
      return null
    })
}

export async function getVariantPointConfig(
  variantId: string
): Promise<VariantPointConfig | null> {
  return await sdk.client
    .fetch<{ point_config: VariantPointConfig }>(
      `/store/variants/${variantId}/point-config`,
      {
        method: "GET",
        cache: "no-store",
      }
    )
    .then(({ point_config }) => point_config)
    .catch((err) => {
      console.error(
        `Failed to fetch point config for variant ${variantId}:`,
        err
      )
      return null
    })
}

export async function redeemCoinsOnCart(
  cartId: string,
  variantIds?: string[]
) {
  const authHeaders = await getAuthHeaders()

  if (!authHeaders || !("authorization" in authHeaders)) {
    throw new Error("You must be logged in to redeem coins")
  }

  const result = await sdk.client
    .fetch<{ cart: any }>(`/store/customers/me/points/redeem`, {
      method: "POST",
      headers: authHeaders,
      body: {
        cart_id: cartId,
        ...(variantIds ? { variant_ids: variantIds } : {}),
      },
    })
    .catch((err) => {
      console.error("[redeemCoinsOnCart] error:", err)
      console.error("[redeemCoinsOnCart] error status:", err?.status)
      console.error("[redeemCoinsOnCart] error statusText:", err?.statusText)
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to redeem coins"
      throw new Error(message)
    })

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)

  const coinsCacheTag = await getCacheTag("coins")
  revalidateTag(coinsCacheTag)

  return result
}

export async function removeCoinsFromCart(cartId: string) {
  const authHeaders = await getAuthHeaders()

  if (!authHeaders || !("authorization" in authHeaders)) {
    throw new Error("You must be logged in to remove coins")
  }

  const result = await sdk.client
    .fetch<{ cart: any }>(`/store/customers/me/points/redeem`, {
      method: "DELETE",
      headers: authHeaders,
      body: { cart_id: cartId },
    })
    .catch((err) => {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to remove coins"
      throw new Error(message)
    })

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)

  const coinsCacheTag = await getCacheTag("coins")
  revalidateTag(coinsCacheTag)

  return result
}
