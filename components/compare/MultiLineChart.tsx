"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

const COLORS = ["#2563eb", "#16a34a", "#dc2626", "#7c3aed", "#ea580c"]

export function MultiTechLineChart({
  data,
  title,
  yLabel,
}: {
  data: any[]
  title: string
  yLabel: string
}) {
  if (!data.length) return null

  const techs = Object.keys(data[0]).filter((k) => k !== "year")

  return (
    <div className="rounded-xl border p-4">
      <h3 className="font-semibold mb-2">{title}</h3>

      <ResponsiveContainer width="100%" height={420}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis label={{ value: yLabel, angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Legend />

          {techs.map((tech, i) => (
            <Line
              key={tech}
              type="monotone"
              dataKey={tech}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
