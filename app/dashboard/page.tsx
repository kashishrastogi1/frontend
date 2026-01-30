"use client";
console.log("DASHBOARD FILE VERSION: 2026-CRITICAL-FIX");
console.log("kashish khyati");

import { BACKEND_URL } from "@/lib/utils/api";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { KeyInsightsCards } from "@/components/key-insights-cards";
import { VisualizationArea } from "@/components/visualization-area";
import { SidebarPanels } from "@/components/sidebar-panels";
import { KnowledgeGraph } from "@/components/knowledge-graph";
import { applyFilters } from "@/lib/filters/applyFilters";
import { defaultFilters, DashboardFilters } from "@/lib/filters/types";
import { defaultKGFilters, KGFilters } from "@/lib/filters/types";
import { ThemeToggle } from "@/components/theme-toggle";
import { filterKnowledgeGraph } from "@/lib/filters/filterKnowledgeGraph";

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
  const [isProcessing, setIsProcessing] = useState(false);

  const [filters, setFilters] =
    useState<DashboardFilters>(defaultFilters);
  const [kgFilters, setKgFilters] =
    useState<KGFilters>(defaultKGFilters);

  /* ---------------- FETCH TECHNOLOGY ---------------- */
  useEffect(() => {
    let cancelled = false;

    async function loadTech() {
      try {
        setError(null);
        setData(null);
        setKg(null);
        setIsProcessing(false);

        const encodedTech = encodeURIComponent(techName);
        const res = await fetch(
          `${BACKEND_URL}/api/technology/${encodedTech}`
        );

        if (!res.ok && res.status !== 202) {
          throw new Error("Technology data not available");
        }

        const json = await res.json();

        if (json.status === "processing") {
          if (!cancelled) {
            setIsProcessing(true);
          }

          setTimeout(() => {
            if (!cancelled) loadTech();
          }, 5000);

          return;
        }

        if (!cancelled) {
          setIsProcessing(false);
          setData(json.dashboard);
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

  /* ---------------- FILTER LOGIC ---------------- */
  useEffect(() => {
    if (isProcessing || !data?.entities?.patents?.length) return;

    const years = data.entities.patents
      .map((p: any) => p.year)
      .filter((y: any) => typeof y === "number");

    if (!years.length) return;

    setFilters((prev) => ({
      ...prev,
      patentYearRange: [Math.min(...years), Math.max(...years)],
    }));
  }, [data, isProcessing]);

  const filteredData = useMemo(() => {
    if (!data) return null;
    return applyFilters(data, filters);
  }, [data, filters]);

  const patentYears = useMemo(() => {
    if (!data?.patent_timeline?.length) return [];
    return data.patent_timeline
      .map((p: any) => p.year)
      .filter((y: any) => typeof y === "number");
  }, [data]);

  const minPatentYear =
    patentYears.length > 0 ? Math.min(...patentYears) : 2010;
  const maxPatentYear =
    patentYears.length > 0
      ? Math.max(...patentYears)
      : new Date().getFullYear();

  const filteredKG = useMemo(() => {
    if (!kg) return null;
    return filterKnowledgeGraph(kg, kgFilters);
  }, [kg, kgFilters]);

  /* ---------------- UI STATES ---------------- */
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }
  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">
          Generating insights… please wait ⏳
        </p>
      </div>
    );
  }

  if (!filteredData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading analysis data…</p>
      </div>
    );
  }

  /* ---------------- DASHBOARD ---------------- */
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-primary">
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </Link>
            <h1 className="text-2xl font-bold">TechIntel</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <DashboardHeader techName={decodeURIComponent(techName)} />
        <KeyInsightsCards insights={filteredData.summary} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <VisualizationArea
              trendCurve={filteredData.trend_curve ?? []}
              countryInvestment={
                filteredData.country_investment?.values ?? []
              }
              patentTimeline={filteredData.patent_timeline ?? []}
              marketReports={
                filteredData.entities?.market_reports ?? []
              }
            />

            {/* Knowledge Graph */}
            {kg && kg.nodes?.length > 0 && (
              <div className="mt-6 rounded-xl border bg-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-semibold">Knowledge Graph</h2>
                  <button
                    onClick={() => setShowKG(!showKG)}
                    className="px-3 py-1.5 text-xs rounded-md border bg-background hover:bg-muted transition"
                  >
                    {showKG ? "Hide Graph" : "Show Graph"}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                Acts as the brain of the platform, linking data across domains.
                It allows users to explore context, relationships, and trends in one place.
                </p>

                {showKG && (
                  <>
                    <div className="flex flex-wrap gap-4 mb-3">
                      <LegendItem color="bg-sky-300" label="Technology" />
                      <LegendItem color="bg-green-500" label="Company" />
                      <LegendItem color="bg-blue-600" label="Patent" />
                      <LegendItem color="bg-green-200" label="Paper" />
                      <LegendItem color="bg-pink-300" label="Country" />
                    </div>

                    <div className="mb-4 space-y-3 rounded-md border bg-muted/30 p-3">
                      <div className="flex flex-wrap gap-4 text-xs">
                        {Object.entries(kgFilters.nodeTypes).map(
                          ([key, value]) => (
                            <label
                              key={key}
                              className="flex items-center gap-1 capitalize"
                            >
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
                          )
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 text-xs">
                        {Object.entries(kgFilters.relations).map(
                          ([key, value]) => (
                            <label
                              key={key}
                              className="flex items-center gap-1"
                            >
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
                          )
                        )}
                      </div>
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
        </div>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<p className="p-6">Loading dashboard…</p>}>
      <DashboardContent />
    </Suspense>
  );
}
