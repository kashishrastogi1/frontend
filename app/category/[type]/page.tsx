"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, TrendingUp, TrendingDown, FileText } from "lucide-react"
import { BACKEND_URL } from "@/lib/utils/api"

type CategoryType = "trends" | "investments" | "patents"

interface CategoryItem {
  id: string
  title: string
  description: string
  date: string
  metadata: string
}

const CATEGORY_CONFIG: Record<
  CategoryType,
  { title: string; description: string; icon: React.ReactNode; color: string }
> = {
  trends: {
    title: "Recent Trends",
    description:
      "Latest technology developments and market movements shaping the industry",
    icon: <TrendingUp className="w-6 h-6" />,
    color: "text-blue-600 dark:text-blue-400",
  },
  investments: {
    title: "Recent Investments",
    description:
      "Funding rounds and investment activity driving technological advancement",
    icon: <TrendingDown className="w-6 h-6" />,
    color: "text-emerald-600 dark:text-emerald-400",
  },
  patents: {
    title: "Recent Patents",
    description: "Patent filings and grants across technology domains",
    icon: <FileText className="w-6 h-6" />,
    color: "text-amber-600 dark:text-amber-400",
  },
}

export default function CategoryPage() {
  const router = useRouter()
  const params = useParams()
  const type = (params.type as CategoryType) || "trends"

  const config = CATEGORY_CONFIG[type]

  const [data, setData] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        /* ================= TRENDS ================= */
        if (type === "trends") {
          const res = await fetch(`${BACKEND_URL}/api/global`)
          if (!res.ok) throw new Error("Trends API failed")

          const json = await res.json()

          const mapped: CategoryItem[] = (json.trends ?? []).map(
            (t: any, i: number) => ({
              id: String(i),
              title: t.title,
              description: t.source ?? t.snippet ?? "Technology news",
              date: t.date ?? "Recent",
              metadata: t.field ?? "Trend",
            })
          )

          if (!cancelled) setData(mapped)
          return
        }

        /* ================= PATENTS ================= */
        if (type === "patents") {
          const res = await fetch(`${BACKEND_URL}/api/global`)
          if (!res.ok) throw new Error("Patents API failed")

          const json = await res.json()

          const mapped: CategoryItem[] = (json.patents ?? []).map(
            (p: any, i: number) => ({
              id: String(i),
              title: p.title,
              description: p.assignee ?? "Patent filing",
              date: p.year ? String(p.year) : "Recent",
              metadata: p.field ?? "Patent",
            })
          )

          if (!cancelled) setData(mapped)
          return
        }

        /* ================= INVESTMENTS ================= */
        if (type === "investments") {
          const res = await fetch(`${BACKEND_URL}/api/global-investment`)
          if (!res.ok) throw new Error("Investment API failed")

          const json = await res.json()

          const rows: CategoryItem[] = []

          Object.entries(json ?? {}).forEach(
            ([country, countryData]: any) => {
              Object.entries(countryData?.technologies ?? {}).forEach(
                ([tech, techData]: any) => {
                  (techData?.articles ?? []).forEach((a: any, idx: number) => {
                    if (!a?.title) return

                    rows.push({
                      id: `${country}-${tech}-${idx}`,
                      title: a.title,
                      description: a.source ?? "Investment news",
                      date: a.date ?? "Recent",
                      metadata: `${tech.toUpperCase()} · ${country.toUpperCase()}`,
                    })
                  })
                }
              )
            }
          )

          if (!cancelled) setData(rows)
          return
        }
      } catch (err) {
        console.error("Category page error:", err)
        if (!cancelled) setError("Data not available")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadData()
    return () => {
      cancelled = true
    }
  }, [type])

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b sticky top-0 z-50 bg-background/95">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-primary mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Home
          </button>

          <div className="flex items-center gap-3">
            <div className={config.color}>{config.icon}</div>
            <div>
              <h1 className="text-3xl font-bold">{config.title}</h1>
              <p className="text-muted-foreground">{config.description}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex justify-center px-4 py-8">
        <div className="w-full max-w-3xl space-y-4">
          {loading && (
            <p className="text-center text-muted-foreground">
              Loading {config.title.toLowerCase()}...
            </p>
          )}

          {error && (
            <p className="text-center text-sm text-red-500">{error}</p>
          )}

          {!loading &&
            !error &&
            data.map((item) => (
              <Card key={item.id} className="hover:shadow-md">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="mt-1">{config.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <p className="text-muted-foreground mb-3">
                        {item.description}
                      </p>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{item.date}</span>
                        <span className="px-3 py-1 rounded-full bg-secondary text-xs">
                          {item.metadata}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </main>
  )
}
