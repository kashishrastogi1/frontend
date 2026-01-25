import { createContext, useContext } from "react"
import { TechData } from "@/lib/filters/types"

export const CompareContext = createContext<{
  techs: string[]
  data: Record<string, TechData>
} | null>(null)

export const useCompare = () => {
  const ctx = useContext(CompareContext)
  if (!ctx) throw new Error("CompareContext missing")
  return ctx
}
