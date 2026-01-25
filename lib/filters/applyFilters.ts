import { DashboardFilters } from "./types"

export function applyFilters(
  dashboard: any,
  filters: DashboardFilters
) {
  if (!dashboard || !dashboard.entities) {
    return dashboard
  }

  const filtered = {
    ...dashboard,
    entities: { ...dashboard.entities },
  }

    /* ================= PATENTS ================= */
if (filters.entities.patents && dashboard.entities?.patents) {
  filtered.entities.patents = dashboard.entities.patents.filter((p: any) => {
    if (
      typeof p.year === "number" &&
      (p.year < filters.patentYearRange[0] ||
       p.year > filters.patentYearRange[1])
    ) {
      return false
    }

    if (filters.country) {
      const needle = filters.country.toLowerCase()
      const text = `${p.title ?? ""} ${p.snippet ?? ""}`.toLowerCase()
      if (!text.includes(needle)) return false
    }

    return true
  })
} else {
  filtered.entities.patents = []
}


    // ================= PATENT TIMELINE =================
if (dashboard.patent_timeline) {
  let timeline = [...dashboard.patent_timeline]

  // Year range
  timeline = timeline.filter(
    (pt) =>
      pt.year >= filters.patentYearRange[0] &&
      pt.year <= filters.patentYearRange[1]
  )

  // Min density
  if (filters.patentDensity.minCount > 1) {
    timeline = timeline.filter(
      (pt) => pt.count >= filters.patentDensity.minCount
    )
  }

  // Top N years
  if (filters.patentDensity.topN) {
    timeline = timeline
      .sort((a, b) => b.count - a.count)
      .slice(0, filters.patentDensity.topN)
      .sort((a, b) => a.year - b.year)
  }

  filtered.patent_timeline = timeline
}




  /* ================= PAPERS ================= */
  if (filters.entities.papers && dashboard.entities.papers) {
    filtered.entities.papers = dashboard.entities.papers.filter((p: any) => {
      if (!filters.country) return true
      const needle = filters.country.toLowerCase()
      return (
        p.title?.toLowerCase().includes(needle) ||
        p.snippet?.toLowerCase().includes(needle)
      )
    })
  } else {
    filtered.entities.papers = []
  }
  /* ================= COMPANIES ================= */
  if (filters.entities.companies && dashboard.entities.companies) {
    filtered.entities.companies = dashboard.entities.companies.filter((c: any) => {
      if (!filters.country) return true
      const needle = filters.country.toLowerCase()
      return (
        c.name?.toLowerCase().includes(needle) ||
        c.description?.toLowerCase().includes(needle)
      )
    })
  } else {
    filtered.entities.companies = []
  }

  return filtered
}
