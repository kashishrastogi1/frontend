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

  const graphData = useMemo(() => {
    return {
      nodes: visibleNodes.map((n) => ({
        id: String(n.id),
        type: n.type,
        url: n.url,
      })),
      links: visibleEdges.map((e) => ({
        source: String(e.source),
        target: String(e.target),
        relation: e.relation,
      })),
    }
  }, [visibleNodes, visibleEdges])

  // ✅ zoom after render
  useEffect(() => {
    if (!fgRef.current) return
    const t = setTimeout(() => {
      fgRef.current.zoomToFit(500, 120)
    }, 400)
    return () => clearTimeout(t)
  }, [graphData])
console.log("NODES:", graphData.nodes.length)
console.log("EDGES:", graphData.links.length)
console.log("SAMPLE NODE:", graphData.nodes[0])
console.log("SAMPLE EDGE:", graphData.links[0])
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
        onNodeClick={(node: any) => {
          if (node.url) window.open(node.url, "_blank")
        }}
      />
    </div>
  )
}