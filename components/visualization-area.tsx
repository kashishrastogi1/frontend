"use client";


import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
} from "recharts";

type PatentPoint = {
  year: number;
  count: number;
};

type MarketReport = {
  title: string;
  market_size: string;
};


type VisualizationAreaProps = {
  trendCurve: number[];
  countryInvestment: Record<string, number>;
  patentTimeline: PatentPoint[];
  marketReports?: MarketReport[];
};

function computeBoxPlotStats(values: number[]) {
  if (values.length === 0) return null

  const sorted = [...values].sort((a, b) => a - b)

  const percentile = (p: number) => {
    const index = (p / 100) * (sorted.length - 1)
    const lower = Math.floor(index)
    const upper = Math.ceil(index)
    if (lower === upper) return sorted[lower]
    return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower)
  }

  return {
    min: sorted[0],
    q1: percentile(25),
    median: percentile(50),
    q3: percentile(75),
    max: sorted[sorted.length - 1],
  }
}

export function VisualizationArea({
  trendCurve = [],
  countryInvestment = {},
  patentTimeline = [],
  marketReports = [],
}: VisualizationAreaProps) {
  // ---------- SAFE TRANSFORMS ----------
  const forecastData =
    trendCurve.length > 0
      ? trendCurve.map((value, index) => ({
          step: `T${index + 1}`,
          value,
        }))
      : [];

  const investmentData =
    countryInvestment && Object.keys(countryInvestment).length > 0
      ? Object.entries(countryInvestment).map(([country, value]) => ({
          country,
          value,
        }))
      : [];

  const marketDistribution = (marketReports || [])
  .map((report, index) => {
    if (!report.market_size || typeof report.market_size !== "string") {
      return null
    }

    const numericValue = parseFloat(
      report.market_size.replace(/[^0-9.]/g, "")
    )

    if (isNaN(numericValue)) return null

    return {
      source: `Report ${index + 1}`,
      value: numericValue,
      title: report.title,
    }
  })
  .filter(Boolean)

const marketValues = marketDistribution
  .map((d) => (d && typeof d.value === "number" ? d.value : null))
  .filter((v): v is number => v !== null)


const boxStats = computeBoxPlotStats(marketValues);
const scatterData = marketDistribution.map((d) => ({
  x: Math.random() * 0.4 - 0.2, // horizontal jitter
  y: d.value,
  title: d.title || "Unknown source",
}))


  const hasForecast = forecastData.length > 0;
  const hasInvestment = investmentData.length > 0;
  const hasPatents = patentTimeline.length > 0;


console.log("marketValues:", marketValues)
console.log("boxStats:", boxStats)
console.log("scatterData:", scatterData)

const summaryDots = boxStats
  ? [
      { x: 0, y: boxStats.min, label: "Min" },
      { x: 0, y: boxStats.q1, label: "Q1" },
      { x: 0, y: boxStats.median, label: "Median" },
      { x: 0, y: boxStats.q3, label: "Q3" },
      { x: 0, y: boxStats.max, label: "Max" },
    ]
  : []


  return (
    <div className="space-y-6">
      {/* ================= Market Forecasting ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Market Forecasting</CardTitle>
          <CardDescription>
            Technology adoption trend derived from ML analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasForecast ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopOpacity={0.3} />
                    <stop offset="95%" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="step" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  strokeWidth={2}
                  fill="url(#trendFill)"
                  name="Adoption Trend"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">
              No trend data available yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ================= Investment Distribution ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Relative Investment Index</CardTitle>
          <CardDescription>
            Country-wise relative investment inferred from patents, research
            output, and industrial presence
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasInvestment ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={investmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="country" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value"  fill="#003f60" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">
              Investment data not available.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ================= Patent Activity ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Patent Activity Timeline</CardTitle>
          <CardDescription>
            Historical patent filing trends (ML-derived)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasPatents ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={patentTimeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  name="Patents Filed"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">
              No patent activity available yet.
            </p>
          )}
        </CardContent>
      </Card>

{/* ================= Market Size Distribution ================= */}
{boxStats && (
  <Card>
    <CardHeader>
      <CardTitle>Market Size Estimate Distribution</CardTitle>
      <CardDescription>
        Independent market size estimates across reports
      </CardDescription>
    </CardHeader>

    <CardContent>
      <ResponsiveContainer width="100%" height={320}>
        <ScatterChart>
          {/* X axis is fake & hidden */}
          <XAxis
            type="number"
            dataKey="x"
            domain={[-5, 5]}
            hide
          />

          {/* Y axis is real */}
          <YAxis
            label={{
              value: "Market Size (USD Billion)",
              angle: -90,
              position: "insideLeft",
              style: {
      textAnchor: "middle",
    },
    offset: 10,
            }}
            domain={[
              (min: number) => Math.floor(min * 0.9),
              (max: number) => Math.ceil(max * 1.1),
            ]}
          />

          <CartesianGrid strokeDasharray="3 3" />

          {/* MIN */}
          <ReferenceLine
            y={boxStats.min}
            stroke="#94a3b8"
            strokeDasharray="3 3"
          />

          {/* MEDIAN */}
          <ReferenceLine
            y={boxStats.median}
            stroke="#0f172a"
            strokeWidth={3}
          />

          {/* MAX */}
          <ReferenceLine
            y={boxStats.max}
            stroke="#94a3b8"
            strokeDasharray="3 3"
          />

          {/* DOTS */}
          <Scatter
            data={scatterData}
            dataKey="y"
            fill="#2563eb"
          />

          {/* TOOLTIP */}
          <Tooltip
  cursor={{ strokeDasharray: "3 3" }}
  content={({ payload }) => {
    if (!payload || !payload.length) return null

    const point = payload[0].payload

    return (
      <div className="rounded-md border bg-background px-3 py-2 shadow-sm">
        <div className="text-sm font-medium">
          {point.title}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Market Size: {point.y.toFixed(1)} B USD
        </div>
      </div>
    )
  }}
/>

        </ScatterChart>
      </ResponsiveContainer>

      {/* Summary stats */}
      <div className="mt-4 grid grid-cols-3 gap-1 text-sm text-muted-foreground">
        <div>Min: {boxStats.min.toFixed(1)} B</div>
        <div>Median: {boxStats.median.toFixed(1)} B</div>
        <div>Max: {boxStats.max.toFixed(1)} B</div>
      </div>
    </CardContent>
  </Card>
)}


    </div>
  );
}