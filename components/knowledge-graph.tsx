"use client"

import dynamic from "next/dynamic"
import { useMemo } from "react"

const ForceGraph2D = dynamic(
  () => import("react-force-graph-2d"),
  { ssr: false }
)

type KGNode = {
  id: string
  type: string
  hidden?: boolean
  url?: string
  x?: number
  y?: number
}

type KGEdge = {
  source: string
  target: string
  relation: string
  hidden?: boolean
}

function centerNodes(nodes: KGNode[]) {
  if (!nodes.length) return nodes

  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity

  nodes.forEach((n) => {
    if (typeof n.x === "number" && typeof n.y === "number") {
      minX = Math.min(minX, n.x)
      maxX = Math.max(maxX, n.x)
      minY = Math.min(minY, n.y)
      maxY = Math.max(maxY, n.y)
    }
  })

  // If nodes never had positions yet
  if (!isFinite(minX) || !isFinite(minY)) return nodes

  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2

  return nodes.map((n) => ({
    ...n,
    x: typeof n.x === "number" ? n.x - centerX : n.x,
    y: typeof n.y === "number" ? n.y - centerY : n.y,
  }))
}

export function KnowledgeGraph({
  nodes,
  edges,
}: {
  nodes: KGNode[]
  edges: KGEdge[]
}) {
  // Filter visible nodes
  const visibleNodes = useMemo(
    () => nodes.filter((n) => !n.hidden),
    [nodes]
  )

  // Filter visible edges
  const visibleEdges = useMemo(
    () => edges.filter((e) => !e.hidden),
    [edges]
  )

  // Center nodes ONLY via coordinates (no camera tricks)
  const centeredNodes = useMemo(
    () => centerNodes(visibleNodes),
    [visibleNodes]
  )

  return (
    <div className="h-[520px] w-full rounded-lg border bg-background">
      <ForceGraph2D
  graphData={{
    nodes: centeredNodes,
    links: visibleEdges,
  }}
  nodeAutoColorBy="type"
  nodeRelSize={6}
  nodeLabel={(n: any) => `${n.id} (${n.type})`}
  linkLabel={(l: any) => l.relation}
  linkDirectionalArrowLength={4}
  linkDirectionalArrowRelPos={1}
  cooldownTicks={120}
  linkColor={() => "#9ca3af"}

  /* ✅ ADD THIS */
  onNodeClick={(node: any) => {
    if (node.url) {
      window.open(node.url, "_blank")
    }
  }}
/>

    </div>
  )
}
