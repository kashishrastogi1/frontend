"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchBar } from "@/components/search-bar";
import { ContentFlashcards } from "@/components/content-flashcards";
import { GlobalComparison } from "@/components/global-comparison";
import { ThemeToggle } from "@/components/theme-toggle";
import { IndiaPulseSection } from "@/components/indian-dashboard";
import { HeroIntro } from "@/components/hero-intro";
import { BACKEND_URL } from "@/lib/utils/api";

export default function HomePage() {
  const router = useRouter();

  const [globalData, setGlobalData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingSuggestion, setPendingSuggestion] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);

  /* ================= GLOBAL DATA ================= */

  useEffect(() => {
    let cancelled = false;

    async function loadGlobal() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/global`);
        if (!res.ok) throw new Error("Failed to load global data");

        const json = await res.json();
        if (!cancelled) setGlobalData(json);
      } catch {
        if (!cancelled) setError("Global trends unavailable");
      }
    }

    loadGlobal();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ================= SEARCH ================= */

  async function handleSearch(query: string) {
    setShowConfirm(false);
    setPendingSuggestion(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/validate-tech`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      if (data.decision === "reject") {
        alert("This does not appear to be a technology.");
        return;
      }

      if (data.decision === "needs_confirmation") {
        setPendingSuggestion(data.suggestion);
        setPendingQuery(query);
        setShowConfirm(true);
        return;
      }

      // ✅ accepted
      router.push(`/dashboard?tech=${encodeURIComponent(data.technology)}`);
    } catch {
      alert("Validation failed. Please try again.");
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">TechIntel</h1>
            <p className="text-sm text-muted-foreground">
              Technology Intelligence Platform
            </p>
          </div>

          <div className="w-full max-w-2xl mx-6 relative">
            <SearchBar onSearch={handleSearch} />

            {showConfirm && pendingSuggestion && (
              <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-background border border-border p-4 rounded shadow z-50">
                <p className="mb-3">
                  Did you mean <b>{pendingSuggestion}</b>?
                </p>

                <div className="flex gap-3 justify-end">
                  <button
                    className="px-3 py-1 bg-primary text-primary-foreground rounded"
                    onClick={() => {
                      setShowConfirm(false);
                      router.push(
                        `/dashboard?tech=${encodeURIComponent(
                          pendingSuggestion
                        )}`
                      );
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

      {/* CONTENT */}
      <div className="flex flex-col items-center px-4 py-10">
        <div className="w-full max-w-6xl">
          <HeroIntro />

          <div className="mb-16 mt-16">
            {error && <p className="text-sm text-red-500">{error}</p>}

            {!globalData ? (
              <p className="text-muted-foreground text-center">
                Loading global trends...
              </p>
            ) : (
              <ContentFlashcards
                trends={globalData.trends}
                summary={globalData.summary}
              />
            )}
          </div>

          <IndiaPulseSection />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="lg:col-span-2">
              <GlobalComparison />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

