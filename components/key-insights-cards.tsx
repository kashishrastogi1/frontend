"use client"

import type React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TrendingUp, Activity, BarChart3, Zap } from "lucide-react"

interface InsightCard {
  id: string
  title: string
  description: string
  metric: string
  value: string | number
  icon: React.ReactNode
  status: "increasing" | "stable" | "decreasing"
}

type KeyInsightsProps = {
  insights: {
    trl: number
    growth_stage: string
    market_size_billion_usd: number
    signals: number
  }
}

export function KeyInsightsCards({ insights }: KeyInsightsProps) {
  const INSIGHTS: InsightCard[] = [
    {
      id: "1",
      title: "Technology Readiness",
      description: "Current maturity level assessment",
      metric: "TRL Level",
      value: `${insights.trl}/9`,
      icon: <Activity className="w-5 h-5" />,
      status: "increasing",
    },
    {
      id: "2",
      title: "S-Curve Position",
      description: "Adoption and market penetration",
      metric: "Stage",
      value: insights.growth_stage,
      icon: <TrendingUp className="w-5 h-5" />,
      status: "increasing",
    },
    {
      id: "3",
      title: "Market Size",
      description: "Projected market value",
      metric: "TAM",
      value: `$${insights.market_size_billion_usd}B`,
      icon: <BarChart3 className="w-5 h-5" />,
      status: "increasing",
    },
    {
      id: "4",
      title: "Tech Convergence",
      description: "Related technology intersections",
      metric: "Signals",
      value: insights.signals,
      icon: <Zap className="w-5 h-5" />,
      status: "stable",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {INSIGHTS.map((insight) => (
        <Card
          key={insight.id}
          className="hover:border-primary/30 transition-all hover:shadow-sm"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-sm font-semibold">
                  {insight.title}
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  {insight.description}
                </CardDescription>
              </div>
              <div className="text-primary/50 flex-shrink-0">
                {insight.icon}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-foreground">
                {insight.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {insight.metric}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
