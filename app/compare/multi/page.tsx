"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"

import { InvestmentBarChart } from "@/components/compare/investment-bar-chart"
import { MultiTechLineChart } from "@/components/compare/MultiLineChart"
import { MultiTechMarketDistribution } from "@/components/compare/MultiTechMarketDistribution"
import { UnifiedKnowledgeGraph } from "@/components/knowledge-graph/UnifiedKnowledgeGraph"
import { buildUnifiedKG } from "@/lib/knowledge-graph/buildUnifiedKG"
import { ThemeToggle } from "@/components/theme-toggle"
import { BackButton } from "@/components/back-button"
import { BACKEND_URL } from "@/lib/utils/api"

/* ================= TYPES ================= */

type MetricType = "trend" | "market" | "patents" | "investment" | "kg"
type TechDataMap = Record<string, any>

/* ================= NORMALIZERS (UNCHANGED) ================= */

function normalizeCurve(dataMap: TechDataMap, key: string) {
  const yearSet = new Set<number>()
  const perTech: Record<string, Record<number, number>> = {}

  Object.entries(dataMap).forEach(([tech, data]) => {
    const raw =
      key.includes(".")
        ? key.split(".").reduce((o: any, k) => o?.[k], data?.dashboard)
        : data?.dashboard?.[key]

    if (!Array.isArray(raw)) return
    perTech[tech] = {}

    raw.forEach((v: any, i: number) => {
      if (typeof v === "object" && typeof v.year === "number") {
        yearSet.add(v.year)
        perTech[tech][v.year] = v.value ?? v.count ?? 0
      }
      if (typeof v === "number") {
        const year = 2020 + i
        yearSet.add(year)
        perTech[tech][year] = v
      }
    })
  })

  return Array.from(yearSet)
    .sort()
    .map((year) => {
      const row: any = { year }
      Object.keys(perTech).forEach((tech) => {
        row[tech] = perTech[tech][year] ?? null
      })
      return row
    })
}

function normalizePatentCurve(dataMap: TechDataMap) {
  const yearSet = new Set<number>()
  const perTech: Record<string, Record<number, number>> = {}

  Object.entries(dataMap).forEach(([tech, data]) => {
    perTech[tech] = {}
    const timeline = data?.dashboard?.patent_timeline ?? []

    timeline.forEach((p: any) => {
      if (typeof p.year === "number") {
        yearSet.add(p.year)
        perTech[tech][p.year] =
          (perTech[tech][p.year] ?? 0) + (p.count ?? 1)
      }
    })
  })

  return Array.from(yearSet)
    .sort()
    .map((year) => {
      const row: any = { year }
      Object.keys(perTech).forEach((tech) => {
        row[tech] = perTech[tech][year] ?? 0
      })
      return row
    })
}

function normalizeInvestmentBars(dataMap: TechDataMap) {
  const countryMap: Record<string, any> = {}
  const techList = Object.keys(dataMap)

  Object.entries(dataMap).forEach(([tech, data]) => {
    const values =
      data?.dashboard?.country_investment?.values ||
      data?.dashboard?.investment_index?.values ||
      {}

    Object.entries(values).forEach(([country, value]: any) => {
      const c =
        country.toLowerCase().includes("united") || country.toLowerCase() === "usa"
          ? "USA"
          : country

      if (!countryMap[c]) countryMap[c] = { country: c }
      countryMap[c][tech] = Number(value) || 0
    })
  })

  Object.values(countryMap).forEach((row: any) => {
    techList.forEach((tech) => {
      if (row[tech] === undefined) row[tech] = 0
    })
  })

  return Object.values(countryMap)
}

function parseMarketSizeToBillion(raw?: string): number | null {
  if (!raw) return null
  const s = raw.toLowerCase().replace(/[$,]/g, "").trim()
  const num = parseFloat(s)
  if (isNaN(num)) return null
  if (s.includes("trillion")) return num * 1000
  if (s.includes("billion")) return num
  if (s.includes("million")) return num / 1000
  return null
}

function normalizeMarketDistribution(dataMap: TechDataMap) {
  return Object.entries(dataMap).map(([tech, data]) => {
    const reports =
      data?.dashboard?.market_reports ??
      data?.dashboard?.entities?.market_reports ??
      []

    const points = reports
      .map((r: any) => {
        const value = parseMarketSizeToBillion(r.market_size)
        if (value === null) return null
        return { value, title: r.title, source: r.source ?? "Market Report" }
      })
      .filter(Boolean)

    return { tech, points }
  })
}

/* ================= PAGE ================= */

export default function MultiComparePage() {
  const baseTech = useSearchParams().get("base")?.toLowerCase() || "ai"

  const [techs, setTechs] = useState<string[]>([baseTech])
  const [dataMap, setDataMap] = useState<TechDataMap>({})
  const [metric, setMetric] = useState<MetricType>("trend")
  const [input, setInput] = useState("")

  const [pendingSuggestion, setPendingSuggestion] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  /* ================= VALIDATE TECH ================= */

  async function handleAddTech(query: string) {
    const res = await fetch(`${BACKEND_URL}/api/validate-tech`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    })

    const data = await res.json()

    if (data.decision === "reject") {
      alert("This does not appear to be a technology.")
      return
    }

    if (data.decision === "needs_confirmation") {
      setPendingSuggestion(data.suggestion)
      setShowConfirm(true)
      return
    }

    if (!techs.includes(data.technology)) {
      setTechs((p) => [...p, data.technology])
    }
  }

  const removeTech = (tech: string) => {
    setTechs((p) => p.filter((t) => t !== tech))
    setDataMap((p) => {
      const copy = { ...p }
      delete copy[tech]
      return copy
    })
  }

  /* ================= FETCH ================= */

  useEffect(() => {
    techs.forEach(async (tech) => {
      if (dataMap[tech]) return

      let res = await fetch(`${BACKEND_URL}/api/tech/${tech}`)

      if (res.status === 404) {
        await fetch(`${BACKEND_URL}/api/tech/${tech}`, { method: "POST" })
        res = await fetch(`${BACKEND_URL}/api/tech/${tech}`)
      }

      if (!res.ok) return

      const json = await res.json()
      setDataMap((p) => ({ ...p, [tech]: json }))
    })
  }, [techs])

  const chartData = useMemo(() => {
    if (techs.length < 2) return null
    if (metric === "trend") return normalizeCurve(dataMap, "trend_curve")
    if (metric === "patents") return normalizePatentCurve(dataMap)
    if (metric === "investment") return normalizeInvestmentBars(dataMap)
    if (metric === "market") return normalizeMarketDistribution(dataMap)
  }, [dataMap, metric, techs.length])

  const unifiedKG = useMemo(() => {
    const inputs = Object.entries(dataMap)
      .map(([tech, data]) =>
        data?.knowledge_graph ? { tech, kg: data.knowledge_graph } : null
      )
      .filter(Boolean) as any[]

    return inputs.length ? buildUnifiedKG(inputs) : null
  }, [dataMap])

  const hasMarketPoints =
    metric === "market" &&
    Array.isArray(chartData) &&
    chartData.some((t: any) => t.points?.length)

  /* ================= UI ================= */

  return (
    <div className="w-full">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center gap-6">
          <BackButton />
          <h1 className="text-xl font-bold">Multi-Tech Comparison</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <input
          value={input}
          placeholder="Add technology (press Enter)"
          className="border px-4 py-2 rounded-md w-full max-w-md"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && input.trim()) {
              handleAddTech(input.trim())
              setInput("")
            }
          }}
        />

        {metric === "kg" ? (
          unifiedKG ? (
            <UnifiedKnowledgeGraph
              nodes={unifiedKG.nodes}
              edges={unifiedKG.edges}
            />
          ) : (
            <p className="text-muted-foreground">No KG data available.</p>
          )
        ) : !chartData ||
          chartData.length === 0 ||
          (metric === "market" && !hasMarketPoints) ? (
          <p className="text-muted-foreground">
            No data available for selected technologies.
          </p>
        ) : metric === "investment" ? (
          <InvestmentBarChart data={chartData as any} />
        ) : metric === "market" ? (
          <MultiTechMarketDistribution data={chartData as any} />
        ) : (
          <MultiTechLineChart
            data={chartData as any}
            title={metric === "trend" ? "Adoption Trend" : "Patent Activity"}
            yLabel={metric === "trend" ? "Adoption Index" : "Patent Count"}
          />
        )}
      </main>
    </div>
  )
}
