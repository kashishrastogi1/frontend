"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BACKEND_URL } from "@/lib/utils/api"
/* ---------- Types ---------- */

type Technology = {
  signal_count: number
  investment_percent: number
  articles: any[]
}

type CountryNode = {
  total_signals: number
  technologies: Record<string, Technology>
}

type GlobalInvestmentJSON = Record<string, CountryNode>

/* ---------- Labels ---------- */

const COUNTRY_LABELS: Record<string, string> = {
  uk: "United Kingdom",
  india: "India",
  usa: "United States",
  japan: "Japan",
  germany: "Germany",
}

/* ---------- Component ---------- */

export function GlobalComparison() {
  const [data, setData] = useState<GlobalInvestmentJSON | null>(null)
  const [selectedCountry, setSelectedCountry] = useState("")

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/global`)
      .then((res) => res.json())
      .then((json) => {
         setData(json.investments)
         const first = Object.keys(json)[0]
         if (first) setSelectedCountry(first)
      })
      .catch(console.error)
  }, [])

  if (!data) {
    return (
      <p className="text-muted-foreground text-center">
        Loading investment data…
      </p>
    )
  }

  const countryKeys = Object.keys(data).sort()
  const activeCountry = data[selectedCountry]

  return (
    <div className="w-full space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-foreground">
            Global Relative Investment Index
          </CardTitle>
          <CardDescription>
            Select a country to explore its technology investment distribution
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* ---------- Country Selector ---------- */}
          <div className="flex flex-wrap gap-3">
            {countryKeys.map((key) => {
              const isActive = key === selectedCountry

              return (
                <button
                  key={key}
                  onClick={() => setSelectedCountry(key)}
                  className={[
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
                    isActive
                      ? "bg-primary text-primary-foreground border-border"
                      : "bg-secondary text-secondary-foreground border-border hover:bg-secondary/80",
                  ].join(" ")}
                >
                  {COUNTRY_LABELS[key] ?? key.toUpperCase()}
                </button>
              )
            })}
          </div>

          {/* ---------- Summary ---------- */}
          {activeCountry && (
            <div className="text-sm text-muted-foreground">
              Total investment signals:{" "}
              <span className="font-semibold text-foreground">
                {activeCountry.total_signals}
              </span>
            </div>
          )}

          {/* ---------- Technology Breakdown ---------- */}
          {activeCountry && (
            <div className="space-y-5">
              <h4 className="font-semibold text-base text-foreground">
                {COUNTRY_LABELS[selectedCountry]} — Technology Allocation
              </h4>

              {Object.entries(activeCountry.technologies)
                .sort(
                  (a, b) =>
                    b[1].investment_percent - a[1].investment_percent
                )
                .map(([tech, info], index) => (
                  <div key={tech} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">
                        {tech.replace("_", " ")}
                      </span>
                      <span className="font-semibold text-foreground">
                        {info.investment_percent.toFixed(1)}%
                      </span>
                    </div>

                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${info.investment_percent}%`,
                          backgroundColor: `var(--chart-1)`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
