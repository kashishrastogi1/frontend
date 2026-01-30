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

type MetricType =
  | "trend"
  | "market"
  | "patents"
  | "investment"
  | "kg"

type TechDataMap = Record<string, any>

/* ================= NORMALIZERS ================= */
/* (UNCHANGED – exactly as you had them) */

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

  // 1) Build countryMap normally
  Object.entries(dataMap).forEach(([tech, data]) => {
    const values =
      data?.dashboard?.country_investment?.values ||
      data?.dashboard?.investment_index?.values ||
      data?.dashboard?.values ||
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

  // ✅ 2) Fill missing tech keys with 0 for every country row
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
  const result: { tech: string; points: any[] }[] = []

  Object.entries(dataMap).forEach(([tech, data]) => {
    const reports =
      data?.dashboard?.market_reports ??
      data?.dashboard?.entities?.market_reports ??
      []

    const points: any[] = []

    reports.forEach((r: any) => {
      const value = parseMarketSizeToBillion(r.market_size)
      if (value === null) return
      points.push({
        value,
        title: r.title,
        source: r.source ?? "Market Report",
      })
    })

    result.push({ tech, points })
  })

  return result
}
/* ================= COMPARATIVE HELPERS ================= */

// ---- Patent signal ----
function getPatentSignal(data: any) {
  const timeline = data?.dashboard?.patent_timeline ?? []
  if (timeline.length === 0) return { recent: 0, growth: 0 }

  const last = timeline[timeline.length - 1]?.count ?? 0
  const prev = timeline[timeline.length - 2]?.count ?? 0
  const growth = prev > 0 ? (last - prev) / prev : last

  return { recent: last, growth }
}

// ---- Adoption signal ----
function getAdoptionSignal(data: any) {
  const curve = data?.dashboard?.trend_curve ?? []
  if (curve.length === 0) return { latest: 0, slope: 0 }

  const first =
    typeof curve[0] === "number" ? curve[0] : curve[0]?.value ?? 0
  const last =
    typeof curve[curve.length - 1] === "number"
      ? curve[curve.length - 1]
      : curve[curve.length - 1]?.value ?? 0

  return { latest: last, slope: last - first }
}

// ---- Investment signal ----
function getInvestmentSignal(data: any) {
  const values =
    data?.dashboard?.country_investment?.values ??
    data?.dashboard?.investment_index?.values ??
    {}

  const nums = Object.values(values).map(Number).filter(v => !isNaN(v))
  return {
    total: nums.reduce((a, b) => a + b, 0),
    breadth: nums.length,
  }
}

// ---- Market size signal ----
function getMarketSizeBillion(data: any) {
  const reports =
    data?.dashboard?.entities?.market_reports ??
    data?.dashboard?.market_reports ??
    []

  let max = 0
  for (const r of reports) {
    const raw = r.market_size
    if (!raw) continue
    const s = raw.toLowerCase().replace(/[$,]/g, "")
    const num = parseFloat(s)
    if (isNaN(num)) continue

    if (s.includes("trillion")) max = Math.max(max, num * 1000)
    else if (s.includes("billion")) max = Math.max(max, num)
    else if (s.includes("million")) max = Math.max(max, num / 1000)
  }
  return max
}
function generateComparativeParagraphs(dataMap: TechDataMap, techs: string[]) {
  if (techs.length < 2) return null

  const entries = techs
    .map((tech) => {
      const data = dataMap[tech]
      if (!data) return null

      const patent = getPatentSignal(data)
      const adoption = getAdoptionSignal(data)
      const investment = getInvestmentSignal(data)
      const market = getMarketSizeBillion(data)

      return {
        tech,
        patent,
        adoption,
        investment,
        market,
      }
    })
    .filter(Boolean) as any[]

  if (entries.length < 2) return null

  const top3 = (arr: any[], key: (e: any) => number) =>
    [...arr].sort((a, b) => key(b) - key(a)).slice(0, 3)

  const p = top3(entries, e => e.patent.recent)
  const a = top3(entries, e => e.adoption.latest)
  const i = top3(entries, e => e.investment.total)
  const m = top3(entries, e => e.market)

  return {
    patent: `In terms of patent activity, ${p[0].tech} leads with the highest recent filing volume, indicating strong innovation momentum. ${p[1]?.tech} follows with substantial patent presence but trails the leader in recent activity, while ${p[2]?.tech} ranks next with comparatively moderate patenting intensity.`,
    adoption: `Looking at adoption trends, ${a[0].tech} demonstrates the strongest position, driven by the highest current adoption levels and consistent growth. ${a[1]?.tech} follows closely with solid adoption but slower recent acceleration, whereas ${a[2]?.tech} shows more limited uptake across use cases.`,
    investment: `From an investment perspective, ${i[0].tech} attracts the largest cumulative investment, supported by broad geographic participation. ${i[1]?.tech} remains a strong second with significant funding but a narrower investment footprint, while ${i[2]?.tech} receives comparatively lower overall investment.`,
    market: `In terms of market size, ${m[0].tech} dominates with the largest estimated market, reflecting wide commercial adoption. ${m[1]?.tech} follows with a substantial but smaller market presence, and ${m[2]?.tech} occupies a more niche position with lower overall market scale.`,
  }
}

/* ================= PAGE ================= */

export default function MultiComparePage() {
  const baseTech = useSearchParams().get("base")?.toLowerCase() || "ai"

  const [techs, setTechs] = useState<string[]>([baseTech])
  const [dataMap, setDataMap] = useState<TechDataMap>({})
  const [metric, setMetric] = useState<MetricType>("trend")
  const [input, setInput] = useState("")

  // 🔹 confirmation state
  const [pendingSuggestion, setPendingSuggestion] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  /* ================= VALIDATED ADD ================= */

  async function handleAddTech(query: string) {
    try {
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
        setTechs((prev) => [...prev, data.technology])
      }
    } catch {
      alert("Validation failed.")
    }
  }

  const removeTech = (tech: string) => {
    setTechs((prev) => prev.filter((t) => t !== tech))
    setDataMap((prev) => {
      const copy = { ...prev }
      delete copy[tech]
      return copy
    })
  }

  /* ================= FETCH ================= */

  useEffect(() => {
    techs.forEach(async (tech) => {
      if (dataMap[tech]) return

      let res = await fetch(`${BACKEND_URL}/api/technology/${tech}`)
      if (res.status === 404) {
        await fetch(`${BACKEND_URL}/api/technology/${tech}`, { method: "POST" })
        res = await fetch(`${BACKEND_URL}/api/technology/${tech}`)
      }
      if (!res.ok) return
      const json = await res.json()

      setDataMap((p) => ({ ...p, [tech]: json }))
    })
  }, [techs])
  console.log("DATA MAP:", dataMap)
console.log("INVESTMENT RAW:", Object.keys(dataMap).map(t => ({
  tech: t,
  values: dataMap[t]?.dashboard?.country_investment?.values
})))

  const chartData = useMemo(() => {
    if (techs.length < 2) return null
    switch (metric) {
      case "trend":
        return normalizeCurve(dataMap, "trend_curve")
      case "patents":
        return normalizePatentCurve(dataMap)
      case "investment":
        return normalizeInvestmentBars(dataMap)
      case "market":
        return normalizeMarketDistribution(dataMap)
    }
  }, [dataMap, metric, techs.length])

  const unifiedKG = useMemo(() => {
    const inputs = Object.entries(dataMap)
      .map(([tech, data]) =>
        data?.knowledge_graph ? { tech, kg: data.knowledge_graph } : null
      )
      .filter(Boolean) as { tech: string; kg: any }[]

    if (inputs.length === 0) return null
    return buildUnifiedKG(inputs)
  }, [dataMap])
  const comparativeParagraphs = useMemo(() => {
    return generateComparativeParagraphs(dataMap, techs)
  }, [dataMap, techs])
  const hasMarketPoints =
    metric === "market" &&
    Array.isArray(chartData) &&
    chartData.some((t: any) => Array.isArray(t.points) && t.points.length > 0)

  /* ================= UI ================= */

  return (
    <div className="w-full">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center gap-6">
          <BackButton />
          <h1 className="text-xl font-bold">Multi-Tech Comparison</h1>

          <div className="flex-1 flex justify-center relative">
            <input
              value={input}
              placeholder="Add technology (press Enter)"
              className="border px-4 py-2 rounded-md w-full max-w-md bg-background"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && input.trim()) {
                  handleAddTech(input.trim())
                  setInput("")
                }
              }}
            />

            {showConfirm && pendingSuggestion && (
              <div className="absolute top-14 bg-background border p-4 rounded shadow z-50">
                <p className="mb-3 text-sm">
                  Did you mean <b>{pendingSuggestion}</b>?
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    className="px-3 py-1 bg-primary text-primary-foreground rounded"
                    onClick={() => {
                      setShowConfirm(false)
                      if (!techs.includes(pendingSuggestion)) {
                        setTechs((p) => [...p, pendingSuggestion])
                      }
                    }}
                  >
                    Yes
                  </button>
                  <button
                    className="px-3 py-1 border rounded"
                    onClick={() => setShowConfirm(false)}
                  >
                    No
                  </button>
                </div>
              </div>
            )}
          </div>

          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* CONTROL BAR */}
        <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/30 px-4 py-3">
          <div className="flex gap-1">
            {[
              { id: "trend", label: "Adoption Trend" },
              { id: "market", label: "Market Size" },
              { id: "patents", label: "Patent Activity" },
              { id: "investment", label: "Investment Index" },
              { id: "kg", label: "Knowledge Graph" },
            ].map((opt) => {
              const active = metric === opt.id
              return (
                <button
                  key={opt.id}
                  onClick={() => setMetric(opt.id as MetricType)}
                  className={[
                    "px-3 py-1.5 text-sm rounded-md transition",
                    active
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>

          <div className="flex gap-2 flex-wrap">
            {techs.map((t) => (
              <span key={t} className="px-3 py-1 border rounded-full text-sm">
                {t}
                {techs.length > 1 && (
                  <button
                    onClick={() => removeTech(t)}
                    className="ml-2 font-bold"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
        {comparativeParagraphs && (
  <div className="rounded-lg border bg-card p-4 space-y-4">
    <h2 className="text-base font-semibold">Comparative Intelligence</h2>

    <p className="text-sm text-muted-foreground leading-relaxed">
      {comparativeParagraphs.patent}
    </p>

    <p className="text-sm text-muted-foreground leading-relaxed">
      {comparativeParagraphs.adoption}
    </p>

    <p className="text-sm text-muted-foreground leading-relaxed">
      {comparativeParagraphs.investment}
    </p>

    <p className="text-sm text-muted-foreground leading-relaxed">
      {comparativeParagraphs.market}
    </p>
  </div>
)}

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
          <InvestmentBarChart data={chartData as ReturnType<typeof normalizeInvestmentBars>} />
        ) : metric === "market" ? (
          <MultiTechMarketDistribution data={chartData as ReturnType<typeof normalizeMarketDistribution>} />
        ) : (
          <MultiTechLineChart
            data={chartData as ReturnType<typeof normalizeCurve>}
            title={metric === "trend" ? "Adoption Trend" : "Patent Activity"}
            yLabel={metric === "trend" ? "Adoption Index" : "Patent Count"}
          />
        )}
      </main>
    </div>
  )
}