"use client"

import { createContext, useContext, useState, useCallback } from "react"

type CoinSelectionContextType = {
  selections: Record<string, boolean>
  toggleSelection: (variantId: string) => void
  getSelectedVariantIds: () => string[]
  clearSelections: () => void
}

const CoinSelectionContext = createContext<CoinSelectionContextType | null>(null)

export function CoinSelectionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [selections, setSelections] = useState<Record<string, boolean>>({})

  const toggleSelection = useCallback((variantId: string) => {
    setSelections((prev) => ({
      ...prev,
      [variantId]: !prev[variantId],
    }))
  }, [])

  const getSelectedVariantIds = useCallback(() => {
    return Object.entries(selections)
      .filter(([, selected]) => selected)
      .map(([variantId]) => variantId)
  }, [selections])

  const clearSelections = useCallback(() => {
    setSelections({})
  }, [])

  return (
    <CoinSelectionContext.Provider
      value={{ selections, toggleSelection, getSelectedVariantIds, clearSelections }}
    >
      {children}
    </CoinSelectionContext.Provider>
  )
}

export function useCoinSelection() {
  const ctx = useContext(CoinSelectionContext)
  if (!ctx) {
    throw new Error("useCoinSelection must be used within CoinSelectionProvider")
  }
  return ctx
}
