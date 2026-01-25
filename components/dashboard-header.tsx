"use client"

import { Card } from "@/components/ui/card"
import { CompareDropdown } from "@/components/compare/CompareDropdown"

interface DashboardHeaderProps {
  techName: string
}

export function DashboardHeader({ techName }: DashboardHeaderProps) {
  return (
    <Card className="mb-8 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
      <div className="p-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 capitalize">
            {techName}
          </h1>
          <p className="text-muted-foreground">
            Comprehensive technology intelligence and market analysis
          </p>
        </div>

        {/* ✅ THIS IS THE ONLY PLACE FOR COMPARE */}
        <CompareDropdown baseTech={techName.toLowerCase()} />
      </div>
    </Card>
  )
}
