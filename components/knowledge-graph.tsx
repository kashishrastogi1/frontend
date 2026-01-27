"use client"

import dynamic from "next/dynamic"
import { useEffect, useMemo, useRef } from "react"

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
})

type KGNode = {
  id: string
  type: string
  hidden?: boolean
  url?: string
}

type KGEdge = {
  source: string
  target: string
  relation: string
  hidden?: boolean
}

export function KnowledgeGraph({
  nodes,
  edges,
}: {
  nodes: KGNode[]
  edges: KGEdge[]
}) {
  const fgRef = useRef<any>(null)

  const visibleNodes = useMemo(() => nodes.filter((n) => !n.hidden), [nodes])
  const visibleEdges = useMemo(() => edges.filter((e) => !e.hidden), [edges])

  const graphData = useMemo(
    () => ({
      nodes: visibleNodes.map((n) => ({ ...n })), // fresh copy but WITHOUT x/y edits
      links: visibleEdges.map((e) => ({ ...e })),
    }),
    [visibleNodes, visibleEdges]
  )

  // ✅ Zoom to fit ONCE after data changes
  useEffect(() => {
    if (!fgRef.current) return
    const t = setTimeout(() => {
      fgRef.current.zoomToFit(400, 80)
    }, 300)
    return () => clearTimeout(t)
  }, [graphData])

  return (
    <div className="h-[520px] w-full rounded-lg border bg-background overflow-hidden">
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeAutoColorBy="type"
        nodeRelSize={6}
        nodeLabel={(n: any) => `${n.id} (${n.type})`}
        linkLabel={(l: any) => l.relation}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        linkColor={() => "#9ca3af"}
        cooldownTicks={120}
        onNodeClick={(node: any) => {
          if (node.url) window.open(node.url, "_blank")
        }}
      />
    </div>
  )
}