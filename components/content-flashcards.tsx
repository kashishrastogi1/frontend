"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, FileText, ArrowRight } from "lucide-react"

type CardType = "trends" | "investments" | "patents"

interface FlashcardData {
  count: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  hoverColor: string
}

const FLASHCARDS: Record<CardType, FlashcardData> = {
  trends: {
    count: "48",
    title: "Recent Trends",
    description: "Latest technology developments and market movements",
    icon: <TrendingUp className="w-8 h-8" />,
    color: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
    hoverColor: "hover:border-blue-400 hover:shadow-lg hover:shadow-blue-400/20",
  },
  investments: {
    count: "156",
    title: "Recent Investments",
    description: "Funding rounds and investment activity in key sectors",
    icon: <TrendingDown className="w-8 h-8" />,
    color: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800",
    hoverColor: "hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-400/20",
  },
  patents: {
    count: "2,341",
    title: "Recent Patents",
    description: "Patent filings and grants across technology domains",
    icon: <FileText className="w-8 h-8" />,
    color: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
    hoverColor: "hover:border-amber-400 hover:shadow-lg hover:shadow-amber-400/20",
  },
}

export function ContentFlashcards() {
  const router = useRouter()

  const handleCardClick = (type: CardType) => {
    router.push(`/category/${type}`)
  }

  return (
    <div className="w-full">
      {/* Section Title */}
      <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Explore Technology Intelligence</h2>

      {/* Flashcard Grid - Centered with 3 columns that stack on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-center">
        {(["trends", "investments", "patents"] as CardType[]).map((type) => {
          const card = FLASHCARDS[type]
          return (
            <button key={type} onClick={() => handleCardClick(type)} className="text-left transition-all duration-300">
              <Card
                className={`h-full border-2 cursor-pointer transition-all duration-300 ${card.color} ${card.hoverColor}`}
              >
                <CardContent className="p-6 h-full flex flex-col justify-between">
                  {/* Icon and Count */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-primary opacity-70">{card.icon}</div>
                    <div className="text-3xl font-bold text-primary/80">{card.count}</div>
                  </div>

                  {/* Title and Description */}
                  <div className="flex-1 mb-4">
                    <h3 className="text-lg font-semibold text-black dark:text-white mb-2">{card.title}</h3>
                    <p className="text-sm text-muted-foreground">{card.description}</p>
                  </div>

                  {/* Arrow Indicator */}
                  <div className="flex items-center text-primary font-medium text-sm">
                    Explore <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </CardContent>
              </Card>
            </button>
          )
        })}
      </div>
    </div>
  )
}
