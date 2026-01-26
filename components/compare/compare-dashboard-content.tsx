"use client"
import { BACKEND_URL } from "@/lib/utils/api";
import { useEffect, useMemo, useState } from "react"
import { VisualizationArea } from "@/components/visualization-area"
import { KnowledgeGraph } from "@/components/knowledge-graph"
import { filterKnowledgeGraph } from "@/lib/filters/filterKnowledgeGraph"
import { defaultKGFilters, KGFilters } from "@/lib/filters/types"
import { CompareEntitiesPanel } from "./compare-entities-panel"

export default function CompareDashboardContent({ tech }: { tech: string }) {
  const [data, setData] = useState<any>(null)
  const [kg, setKg] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [kgFilters] = useState<KGFilters>(defaultKGFilters)

    useEffect(() => {
    let cancelled = false
   // const scrollY = window.scrollY   // ✅ ADD THIS

    async function load() {
  if (!tech || tech === "undefined") return

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/technology/${tech}`
    )

    if (!res.ok) {
      throw new Error("Technology data not available")
    }

    const text = await res.text()

    // Prevent HTML / proxy errors from crashing JSON.parse
    if (text.startsWith("<")) {
      throw new Error("Invalid response")
    }

    const json = JSON.parse(text)

    if (!cancelled) {
      setData(json.dashboard ?? json.data ?? json)
      setKg(json.knowledge_graph ?? null)

      // restore scroll
      requestAnimationFrame(() => {
        window.scrollTo({ top: scrollY })
      })
    }
  } catch (err) {
    console.error("❌ Load failed:", err)
    // optional: setError state
  }
}


    load()
    return () => {
        cancelled = true
    }
    }, [tech])


  const filteredKG = useMemo(() => {
    if (!kg) return null
    return filterKnowledgeGraph(kg, kgFilters)
  }, [kg, kgFilters])

  if (error) {
    return <p className="text-sm text-red-500">{error}</p>
  }

  if (!data) {
    return (
      <p className="text-sm text-muted-foreground">
        Loading analysis…
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tech title */}
      <h2 className="text-xl font-semibold capitalize">{tech}</h2>

      {/* Charts */}
      <VisualizationArea
        trendCurve={data.trend_curve ?? []}
        countryInvestment={data.country_investment?.values ?? []}
        patentTimeline={data.patent_timeline ?? []}
        marketReports={data.entities?.market_reports ?? []}
      />

      {/* Knowledge Graph */}
      {filteredKG && filteredKG.nodes?.length > 0 && (
        <div className="rounded-xl border bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">
            Knowledge Graph
          </h3>

          <div className="h-[420px] w-full overflow-hidden rounded-md border">
            <KnowledgeGraph
              nodes={filteredKG.nodes}
              edges={filteredKG.edges}
            />
          </div>
        </div>
      )}

     <CompareEntitiesPanel
  companies={data.entities?.companies ?? []}
  publications={data.entities?.papers ?? []}
  patents={data.entities?.patents ?? []}
/>


    </div>
  )
}
