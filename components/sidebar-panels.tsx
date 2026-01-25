"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DashboardFilters } from "@/lib/filters/types"
import * as Slider from "@radix-ui/react-slider"

import {
  Building2,
  FileText,
  AlertTriangle,
  TrendingUp,
} from "lucide-react"

/* ---------------- TYPES ---------------- */

type Alert = {
  type: "market" | "patent" | "tech"
  message: string
  time: string
}

type Company = {
  name: string
  description?: string
  link?: string
}

type Publication = {
  title: string
  link?: string | null
}

type Patent = {
  title: string
  snippet?: string
  link?: string | null
  year?: number | null
  trl?: number
}

type SidebarPanelsProps = {
  alerts?: Alert[]
  companies?: Company[]
  publications?: Publication[]
  patents?: Patent[]
  minPatentYear: number
  maxPatentYear: number
  filters: DashboardFilters
  setFilters: React.Dispatch<React.SetStateAction<DashboardFilters>>
}


/* ---------------- UTILS ---------------- */

function extractLinkAndCleanTitle(title: string) {
  const urlRegex = /https?:\/\/[^\s]+/g
  const match = title.match(urlRegex)

  return {
    link: match ? match[0] : null,
    cleanTitle: title.replace(urlRegex, "").replace(/:\s*$/, "").trim(),
  }
}

/* ---------------- COMPONENT ---------------- */

export function SidebarPanels({
  alerts = [],
  companies = [],
  publications = [],
  patents = [],
  filters,
  setFilters,
  minPatentYear,
  maxPatentYear,
}: SidebarPanelsProps) {
  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "market":
        return <TrendingUp className="w-4 h-4 text-blue-500" />
      case "patent":
        return <FileText className="w-4 h-4 text-purple-500" />
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
    }
  }

  return (
    <div className="space-y-4">
     
      {/* ================= FILTERS ================= */}
<Card>
  <CardHeader>
    <CardTitle className="text-sm font-semibold">Filters</CardTitle>
    <CardDescription className="text-xs">
      Refine technology insights
    </CardDescription>
  </CardHeader>

  <CardContent className="space-y-5">

{/* -------- Patent Year Range -------- */}
<div>
  <p className="text-xs mb-2">
    Patent Year Range: {filters.patentYearRange[0]} – {filters.patentYearRange[1]}
  </p>

  <Slider.Root
    className="relative flex items-center select-none touch-none w-full h-5"
    min={minPatentYear}
    max={maxPatentYear}
    step={1}
    value={filters.patentYearRange}
    onValueChange={(value) =>
      setFilters((f) => ({
        ...f,
        patentYearRange: value as [number, number],
      }))
    }
  >
    <Slider.Track className="bg-muted relative grow rounded-full h-1">
      <Slider.Range className="absolute bg-primary rounded-full h-full" />
    </Slider.Track>
    <Slider.Thumb className="block w-4 h-4 bg-primary rounded-full" />
    <Slider.Thumb className="block w-4 h-4 bg-primary rounded-full" />
  </Slider.Root>

  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
    <span>{minPatentYear}</span>
    <span>{maxPatentYear}</span>
  </div>
</div>



    {/* -------- Entity Toggles -------- */}
    <div>
      <p className="text-xs font-medium mb-2">Show Entities</p>

      {(["patents", "papers", "companies"] as const).map((key) => (
        <label key={key} className="flex items-center gap-2 text-sm mb-1">
          <input
            type="checkbox"
            checked={filters.entities[key]}
            onChange={(e) =>
              setFilters(f => ({
                ...f,
                entities: {
                  ...f.entities,
                  [key]: e.target.checked,
                },
              }))
            }
          />
          {key.charAt(0).toUpperCase() + key.slice(1)}
        </label>
      ))}
    </div>
  </CardContent>
</Card>


      {/* ================= ALERTS ================= */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Alert Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts.length === 0 && (
            <p className="text-xs text-muted-foreground">No alerts yet</p>
          )}

          {alerts.map((alert, i) => (
            <div
              key={i}
              className="flex gap-3 border border-border rounded-md p-3"
            >
              {getAlertIcon(alert.type)}
              <div>
                <p className="text-sm font-medium">{alert.message}</p>
                <p className="text-xs text-muted-foreground">{alert.time}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ================= COMPANIES ================= */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <CardTitle className="text-base">Related Companies</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Key players in the ecosystem
          </CardDescription>
        </CardHeader>

        <CardContent className="max-h-[260px] overflow-y-auto space-y-2 pr-1">
          {companies.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No companies available
            </p>
          )}

          {companies.map((company, i) => (
            <div
              key={i}
              className="p-2 rounded-md border border-border/30 bg-secondary/30"
            >
              {company.link ? (
                <a
                  href={company.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {company.name}
                </a>
              ) : (
                <p className="text-sm font-medium">{company.name}</p>
              )}

              {company.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {company.description}
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ================= PUBLICATIONS ================= */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-accent" />
            <CardTitle className="text-base">Publications</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Research & analysis sources
          </CardDescription>
        </CardHeader>

        <CardContent className="max-h-[260px] overflow-y-auto space-y-2 pr-1">
          {publications.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No publications available
            </p>
          )}

          {publications.map((pub, i) => {
            const extracted = extractLinkAndCleanTitle(pub.title)
            const link = pub.link || extracted.link
            const title = extracted.cleanTitle || pub.title

            return (
              <div
                key={i}
                className="p-2 rounded-md border border-border/30 bg-secondary/30"
              >
                {link ? (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {title}
                  </a>
                ) : (
                  <p className="text-sm">{title}</p>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* ================= PATENTS ================= */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-500" />
            <CardTitle className="text-base">Patents</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Key filed patents (ML-derived)
          </CardDescription>
        </CardHeader>

        <CardContent className="max-h-[260px] overflow-y-auto space-y-2 pr-1">
          {patents.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No patents available
            </p>
          )}

          {patents.map((patent, i) => (
            <div
              key={i}
              className="p-2 rounded-md border border-border/30 bg-secondary/30"
            >
              {patent.link ? (
                <a
                  href={patent.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {patent.title}
                </a>
              ) : (
                <p className="text-sm font-medium">{patent.title}</p>
              )}

              {patent.year && (
                <p className="text-xs text-muted-foreground">
                  Year: {patent.year} · TRL: {patent.trl ?? "N/A"}
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  )
}