"use client"

import dynamic from "next/dynamic"
import { useMemo, useRef } from "react"

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

  // ✅ visible nodes
  const visibleNodes = useMemo(() => nodes.filter((n) => !n.hidden), [nodes])

  // ✅ visible edges
  const visibleEdges = useMemo(() => edges.filter((e) => !e.hidden), [edges])

  // ✅ Map for ID -> node (important)
  const nodeMap = useMemo(() => {
    const m = new Map<string, KGNode>()
    visibleNodes.forEach((n) => m.set(String(n.id), n))
    return m
  }, [visibleNodes])

  // ✅ convert edges to OBJECT links so force-graph always connects
  const objectLinks = useMemo(() => {
    return visibleEdges
      .map((e) => {
        const s = nodeMap.get(String(e.source))
        const t = nodeMap.get(String(e.target))
        if (!s || !t) return null
        return {
          source: s,
          target: t,
          relation: e.relation,
        }
      })
      .filter(Boolean) as any[]
  }, [visibleEdges, nodeMap])

  const graphData = useMemo(() => {
    return {
      nodes: visibleNodes.map((n) => ({ ...n })),
      links: objectLinks,
    }
  }, [visibleNodes, objectLinks])

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
        cooldownTicks={200}

        // ✅ zoom only when simulation finishes (BEST)
        onEngineStop={() => {
          fgRef.current?.zoomToFit(500, 120)
        }}

        onNodeClick={(node: any) => {
          if (node.url) window.open(node.url, "_blank")
        }}
      />
    </div>
  )
}