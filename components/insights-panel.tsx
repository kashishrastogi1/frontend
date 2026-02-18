"use client"
import React from "react"

export default function InsightsPanel({ paper }: any) {

  if (!paper) {
    return (
      <div className="p-3 text-xs text-muted-foreground border rounded-md">
        Select a publication to view insights
      </div>
    )
  }

  const insights = paper.insights || {}

  return (
    <div className="p-3 border rounded-md space-y-3 bg-muted/30">

      <h4 className="text-sm font-semibold">
        Insights
      </h4>

      {insights.tech_domain && (
        <div className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-full inline-block">
          {insights.tech_domain}
        </div>
      )}

      <Insight label="Summary" value={insights.summary} />
      <Insight label="Objective" value={insights.objective} />
      <Insight label="Methodology" value={insights.methodology} />
      <Insight label="Defense Relevance" value={insights.defense_relevance} />
      <Insight label="Strategic Impact" value={insights.strategic_impact} />
      <Insight label="Limitations" value={insights.limitations} />

      {paper.link && (
        <a
          href={paper.link}
          target="_blank"
          className="text-xs text-primary underline"
        >
          Open Paper ↗
        </a>
      )}
    </div>
  )
}

/* Small reusable block */
function Insight({ label, value }: any) {
  if (!value) return null

  return (
    <div>
      <p className="text-[11px] font-semibold">{label}</p>
      <p className="text-xs text-muted-foreground">{value}</p>
    </div>
  )
}
