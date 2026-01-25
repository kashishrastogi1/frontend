"use client"

import { useSearchParams } from "next/navigation"
import { useState } from "react"

import CompareDashboardContent from "@/components/compare/compare-dashboard-content"
import { ThemeToggle } from "@/components/theme-toggle"
import { BackButton } from "@/components/back-button"
import { BACKEND_URL } from "@/lib/utils/api"

export default function ComparePage() {
  const searchParams = useSearchParams()

  // 🔒 FIXED LEFT DASHBOARD
  const baseTech = searchParams.get("base")?.toLowerCase() || "ai"

  // 🔁 RIGHT DASHBOARD
  const [rightTech, setRightTech] = useState<string | null>(null)

  // 🔹 Confirmation state
  const [pendingSuggestion, setPendingSuggestion] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  /* ================= VALIDATED SEARCH ================= */

  async function handleCompareSearch(query: string) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      })

      const data = await res.json()

      if (data.decision === "reject") {
        alert("This does not appear to be a valid technology.")
        return
      }

      if (data.decision === "needs_confirmation") {
        setPendingSuggestion(data.suggestion)
        setShowConfirm(true)
        return
      }

      // ✅ accepted
      setRightTech(data.technology)
    } catch {
      alert("Validation failed. Please try again.")
    }
  }

  return (
    <div className="w-full">
      {/* ================= TOP HEADER ================= */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center gap-6">

          {/* LEFT */}
          <div className="flex items-center gap-3 shrink-0">
            <BackButton />
            <h1 className="text-xl font-bold">TechIntel</h1>
          </div>

          {/* CENTER: SEARCH */}
          <div className="flex-1 flex justify-center relative">
            <input
              placeholder="Search technology to compare…"
              className="border px-4 py-2 rounded-md w-full max-w-lg bg-background"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const value = e.currentTarget.value.toLowerCase().trim()
                  if (!value) return
                  handleCompareSearch(value)
                  e.currentTarget.value = ""
                }
              }}
            />

            {/* 🔹 CONFIRMATION POPUP */}
            {showConfirm && pendingSuggestion && (
              <div className="absolute top-14 bg-background border border-border p-4 rounded shadow z-50 w-[320px]">
                <p className="mb-3 text-sm">
                  Did you mean <b>{pendingSuggestion}</b>?
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    className="px-3 py-1 bg-primary text-primary-foreground rounded"
                    onClick={() => {
                      setShowConfirm(false)
                      setRightTech(pendingSuggestion)
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

          {/* RIGHT */}
          <div className="shrink-0">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ================= DASHBOARDS ================= */}
      <div className="mx-auto max-w-7xl grid grid-cols-2 gap-6 p-6">
        <CompareDashboardContent tech={baseTech} />
        {rightTech && <CompareDashboardContent tech={rightTech} />}
      </div>
    </div>
  )
}
