"use client"

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts"

type MarketPoint = {
  value: number
  title?: string
  source?: string
}

type TechMarketData = {
  tech: string
  points: MarketPoint[]
}
const COLOR_PALETTE = [
  "#2563eb", // blue
  "#16a34a", // green
  "#dc2626", // red
  "#9333ea", // purple
  "#ea580c", // orange
  "#0d9488", // teal
  "#4f46e5", // indigo
  "#be123c", // rose
]

export function MultiTechMarketDistribution({
  data,
}: {
  data: TechMarketData[]
}) {
  if (!data.length) return null

  return (
    <div className="h-[420px] w-full rounded-xl border p-4">
<ResponsiveContainer width="100%" height={400}>
  <ScatterChart>
    <CartesianGrid strokeDasharray="3 3" />

    <XAxis type="number" dataKey="x" hide />

    <YAxis
      type="number"
      dataKey="value"
      label={{
        value: "Market Size (USD B)",
        angle: -90,
        position: "insideLeft",
      }}
    />

    <Tooltip
      content={({ payload }) => {
        if (!payload?.length) return null
        const p = payload[0].payload
        return (
          <div className="rounded-md border bg-white p-2 shadow">
            <div className="font-medium">{p.title}</div>
            <div className="text-xs text-muted-foreground">
              Market Size: {p.value} B USD
            </div>
          </div>
        )
      }}
    />

    {data.map((techData, techIndex) => {
  const color = COLOR_PALETTE[techIndex % COLOR_PALETTE.length]

  return (
    <Scatter
      key={techData.tech}
      name={techData.tech}
      data={techData.points.map((p, i) => ({
        x: i - techData.points.length / 2,
        value: p.value,
        title: p.title,
        source: p.source,
      }))}
      fill={color}
      r={6}
    />
  )
})}
<Legend />

  </ScatterChart>
</ResponsiveContainer>



    </div>
  )
}
