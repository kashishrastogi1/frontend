"use client";
import { BACKEND_URL } from "@/lib/utils/api"
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { BackButton} from "@/components/back-button";
import { DashboardHeader } from "@/components/dashboard-header";
import { KeyInsightsCards } from "@/components/key-insights-cards";
import { VisualizationArea } from "@/components/visualization-area";
import { SidebarPanels } from "@/components/sidebar-panels";
import { KnowledgeGraph } from "@/components/knowledge-graph";
import { applyFilters } from "@/lib/filters/applyFilters"
import { defaultFilters, DashboardFilters } from "@/lib/filters/types"
import { defaultKGFilters, KGFilters } from "@/lib/filters/types"
import { ThemeToggle } from "@/components/theme-toggle"
import { filterKnowledgeGraph } from "@/lib/filters/filterKnowledgeGraph"
import { fetchMultipleTechs } from "@/lib/utils/useCompareTech";

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-3 h-3 rounded-full ${color}`} />
      <span className="text-muted-foreground text-xs">{label}</span>
    </div>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const techParam = searchParams.get("tech") || "hypersonics";
  const techName = techParam.toLowerCase();

  const [data, setData] = useState<any>(null);
  const [kg, setKg] = useState<any>(null);
  const [showKG, setShowKG] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters)
  const [kgFilters, setKgFilters] = useState<KGFilters>(defaultKGFilters)


  useEffect(() => {
    let cancelled = false;

    async function loadTech() {
      try {
        setError(null);
        setData(null);

        const encodedTech = encodeURIComponent(techName);

        // 1️⃣ Try cached data
// 1️⃣ Fetch from backend
        let res = await fetch(
         `${BACKEND_URL}/api/technology/${encodedTech}`
        );

// 2️⃣ Cache miss → trigger ML via backend
       if (res.status === 404) {
        console.warn("⚠️ Cache miss. Triggering ML pipeline...");

       const runRes = await fetch(
       `${BACKEND_URL}/api/technology/${encodedTech}/run`,
         { method: "POST" }
       );

       if (!runRes.ok) {
        throw new Error("ML pipeline failed");
       }

  // 3️⃣ Fetch again after ML completes
      res = await fetch(
       `${BACKEND_URL}/api/technology/${encodedTech}`
      );
}

        if (!res.ok) {
          throw new Error("Technology data not available");
        }

        const json = await res.json();

        if (!cancelled) {
          setData(json.dashboard ?? json.data ?? json);
          setKg(json.knowledge_graph ?? null);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("Technology data not available");
        }
      }
    }

    loadTech();

    return () => {
      cancelled = true;
    };
  }, [techName]);
  useEffect(() => {
  if (!data?.entities?.patents?.length) return

  const years = data.entities.patents
    .map((p: any) => p.year)
    .filter((y: any) => typeof y === "number")

  if (!years.length) return

  const minYear = Math.min(...years)
  const maxYear = Math.max(...years)

  setFilters((prev) => ({
    ...prev,
    patentYearRange: [minYear, maxYear],
  }))
}, [data])


  const filteredData = useMemo(() => {
    return applyFilters(data, filters)
  }, [data, filters])

  const patentYears = useMemo(() => {
  if (!data?.patent_timeline?.length) return []
  return data.patent_timeline
    .map((p: any) => p.year)
    .filter((y: any) => typeof y === "number")
}, [data])
const minPatentYear =
  patentYears.length > 0 ? Math.min(...patentYears) : 2010

const maxPatentYear =
  patentYears.length > 0 ? Math.max(...patentYears) : new Date().getFullYear()

 const filteredKG = useMemo(() => {
  if (!kg) return null
  return filterKnowledgeGraph(kg, kgFilters)
}, [kg, kgFilters])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  if (!filteredData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading analysis data...</p>
      </div>
    );
  }
  

  console.log("marketValues:", data)
  return (
    <main className="min-h-screen bg-background">
     {/* Header */}
<header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
  <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
    
    {/* LEFT SIDE */}
    <div className="flex items-center gap-4">
      <Link href="/" className="flex items-center gap-2 text-primary">
        <ChevronLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Back</span>
      </Link>
      <h1 className="text-2xl font-bold">TechIntel</h1>
    </div>
    

    {/* RIGHT SIDE */}
    <div className="flex items-center">
      <ThemeToggle />
    </div>

  </div>
</header>

      <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <DashboardHeader techName={decodeURIComponent(techName)} />

        <KeyInsightsCards insights={filteredData.summary} />

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: ALL CHARTS */}
          <div className="lg:col-span-2">
            <VisualizationArea
              trendCurve={filteredData.trend_curve ?? []}
              countryInvestment={filteredData.country_investment.values ?? []}
              patentTimeline={filteredData.patent_timeline ?? []}
              marketReports={filteredData.entities?.market_reports ?? []}
            />

            {/* Knowledge Graph */}
            {kg && kg.nodes?.length > 0 && (
              <div className="mt-6 rounded-xl border bg-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold">Knowledge Graph</h2>
                  <button
                    onClick={() => setShowKG(!showKG)}
                    className="px-3 py-1.5 text-xs rounded-md border bg-background hover:bg-muted transition"
                  >
                    {showKG ? "Hide Graph" : "Show Graph"}
                  </button>
                </div>

                {showKG && (
                  <>
                    <div className="flex flex-wrap gap-4 mb-3">
                      <LegendItem color="bg-sky-300" label="Technology" />
                      <LegendItem color="bg-green-500" label="Company" />
                      <LegendItem color="bg-blue-600" label="Patent" />
                      <LegendItem color="bg-green-200" label="Paper" />
                      <LegendItem color=" bg-pink-300" label="Country" />
                    </div>
                    {/* -------- KG FILTER CONTROLS -------- */}
                    <div className="mb-4 space-y-3 rounded-md border bg-muted/30 p-3">

                   {/* Node type toggles */}
                      <div className="flex flex-wrap gap-4 text-xs">
                        {Object.entries(kgFilters.nodeTypes).map(([key, value]) => (
                          <label key={key} className="flex items-center gap-1 capitalize">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) =>
                                setKgFilters((f) => ({
                                  ...f,
                                  nodeTypes: {
                                    ...f.nodeTypes,
                                    [key]: e.target.checked,
                                  },
                                }))
                              }
                            />
                            {key}
                          </label>
                        ))}
                      </div>

                      {/* Relation toggles */}
                      <div className="flex flex-wrap gap-4 text-xs">
                        {Object.entries(kgFilters.relations).map(([key, value]) => (
                          <label key={key} className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) =>
                                setKgFilters((f) => ({
                                  ...f,
                                  relations: {
                                    ...f.relations,
                                    [key]: e.target.checked,
                                  },
                                }))
                              }
                            />
                            {key.replace("_", " ")}
                          </label>
                        ))}
                      </div>

                      {/* Degree + keyword */}
                      {/* <div className="flex items-center gap-4">
                        <label className="text-xs">
                          Min degree: {kgFilters.minDegree}
                          <input
                            type="range"
                            min={1}
                            max={5}
                            value={kgFilters.minDegree}
                            onChange={(e) =>
                              setKgFilters((f) => ({
                                ...f,
                                minDegree: Number(e.target.value),
                              }))
                            }
                            className="w-32 ml-2"
                          />
                        </label>

                        <input
                          type="text"
                          placeholder="Search node…"
                          className="text-xs px-2 py-1 border rounded w-40"
                          value={kgFilters.keyword ?? ""}
                          onChange={(e) =>
                            setKgFilters((f) => ({
                              ...f,
                              keyword: e.target.value || null,
                            }))
                          }
                        />
                      </div> */}
                    </div>

                    <div className="h-[420px] w-full overflow-hidden rounded-md border">
                      {filteredKG && (
                        <KnowledgeGraph
                          nodes={filteredKG.nodes}
                          edges={filteredKG.edges}
                        />
                      )}

                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: SIDEBAR (ONCE) */}
          {filteredData &&(
          <SidebarPanels
            alerts={filteredData.alerts ?? []}
            companies={filteredData.entities?.companies ?? []}
            publications={filteredData.entities?.papers ?? []}
            patents={filteredData.entities?.patents ?? []}
            filters={filters}
             minPatentYear={minPatentYear}
             maxPatentYear={maxPatentYear}
             setFilters={setFilters}
          />
          )}
        </div>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<p className="p-6">Loading dashboard...</p>}>
      <DashboardContent />
    </Suspense>
  );
}

