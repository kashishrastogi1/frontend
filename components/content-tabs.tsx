"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, FileText } from "lucide-react"

type TabType = "trends" | "investments" | "patents"

interface TabData {
  id: string
  title: string
  description: string
  date: string
  metadata: string
}

const TRENDS: TabData[] = [
  {
    id: "1",
    title: "Quantum Computing Acceleration",
    description: "Major breakthroughs in quantum error correction pushing timelines forward",
    date: "2 hours ago",
    metadata: "High Impact",
  },
  {
    id: "2",
    title: "AI Chip Consolidation",
    description: "Industry moving towards specialized AI processors over general compute",
    date: "5 hours ago",
    metadata: "Medium Impact",
  },
  {
    id: "3",
    title: "Green Energy Storage Solutions",
    description: "Novel battery technologies showing 3x improvement in energy density",
    date: "1 day ago",
    metadata: "High Impact",
  },
]

const INVESTMENTS: TabData[] = [
  {
    id: "1",
    title: "Series B Round: $150M",
    description: "Advanced Materials Company secures funding for production scaling",
    date: "3 days ago",
    metadata: "$150M",
  },
  {
    id: "2",
    title: "Strategic Investment: $85M",
    description: "Defense tech firm backed by sovereign wealth fund",
    date: "1 week ago",
    metadata: "$85M",
  },
  {
    id: "3",
    title: "Venture Capital Round: $45M",
    description: "Early-stage hypersonics startup closes Series A",
    date: "2 weeks ago",
    metadata: "$45M",
  },
]

const PATENTS: TabData[] = [
  {
    id: "1",
    title: "Patent Filed: Quantum Key Distribution",
    description: "Novel approach to secure quantum communications infrastructure",
    date: "4 days ago",
    metadata: "US Patent",
  },
  {
    id: "2",
    title: "Patent Granted: Advanced Alloys",
    description: "High-temperature ceramic composites for aerospace applications",
    date: "1 week ago",
    metadata: "International",
  },
  {
    id: "3",
    title: "Patent Filed: AI Optimization",
    description: "Breakthrough in neural network efficiency patents",
    date: "2 weeks ago",
    metadata: "Provisional",
  },
]

export function ContentTabs() {
  const [activeTab, setActiveTab] = useState<TabType>("trends")

  const getTabData = (): TabData[] => {
    switch (activeTab) {
      case "investments":
        return INVESTMENTS
      case "patents":
        return PATENTS
      default:
        return TRENDS
    }
  }

  const getIcon = (tab: TabType) => {
    switch (tab) {
      case "investments":
        return <TrendingDown className="w-5 h-5" />
      case "patents":
        return <FileText className="w-5 h-5" />
      default:
        return <TrendingUp className="w-5 h-5" />
    }
  }

  const data = getTabData()

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-border">
        {(["trends", "investments", "patents"] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-2 font-medium text-sm transition-colors border-b-2 ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "trends" && "Recent Trends"}
            {tab === "investments" && "Recent Investments"}
            {tab === "patents" && "Recent Patents"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid gap-3">
        {data.map((item) => (
          <Card key={item.id} className="hover:border-primary/30 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">{getIcon(activeTab)}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{item.date}</span>
                    <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs font-medium">
                      {item.metadata}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
