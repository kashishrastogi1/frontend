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

        // ⏳ ML is running
        if (json.status === "processing") {
          if (!cancelled) {
            setIsProcessing(true);
          }

          // optional polling
          setTimeout(() => {
            if (!cancelled) loadTech();
          }, 5000);

          return;
        }

        // ✅ Data ready
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

            {filteredKG && (
              <div className="mt-6 rounded-xl border bg-card p-4">
                <h2 className="text-sm font-semibold mb-3">
                  Knowledge Graph
                </h2>
                <div className="h-[420px] w-full overflow-hidden rounded-md border">
                  <KnowledgeGraph
                    nodes={filteredKG.nodes}
                    edges={filteredKG.edges}
                  />
                </div>
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
