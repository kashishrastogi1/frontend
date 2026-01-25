"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
const COLORS = [
  "#2563eb", // blue
  "#16a34a", // green
  "#dc2626", // red
  "#7c3aed", // purple
  "#ea580c", // orange
  "#0891b2", // cyan
  "#db2777", // pink
  "#65a30d", // lime
  "#0f766e", // teal
  "#9333ea", // violet
  "#b45309", // amber/brownish
  "#4f46e5", // indigo
  "#0284c7", // sky blue
  "#15803d", // dark green
  "#be123c", // rose
  "#a21caf", // fuchsia
  "#1d4ed8", // deep blue
  "#f97316", // bright orange
  "#06b6d4", // aqua
  "#84cc16", // neon-ish green
]


export function InvestmentBarChart({ data }: { data: any[] }) {
  if (!data.length) return null

  const techs = Object.keys(data[0]).filter((k) => k !== "country")

  return (
    <div className="h-[420px] w-full rounded-xl border p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="country" />
          <YAxis />
          <Tooltip />
          <Legend />
          {techs.map((tech, i) => (
            <Bar
              key={tech}
              dataKey={tech}
              fill={COLORS[i % COLORS.length]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
