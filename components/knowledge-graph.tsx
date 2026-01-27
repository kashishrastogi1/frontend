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
  const norm = (v: any) =>
    String(v ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")

  const nodeIds = new Set(
    visibleNodes.map((n) => norm(n.id))
  )

  const cleanNodes = visibleNodes.map((n) => ({
    id: norm(n.id),
    type: n.type,
    url: n.url,
  }))

  const cleanEdges = visibleEdges
    .map((e) => ({
      source: norm(e.source),
      target: norm(e.target),
      relation: e.relation,
    }))
    // 🔥 DROP ORPHAN EDGES
    .filter(
      (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
    )

  console.log("GRAPH NODES:", cleanNodes.length)
  console.log("GRAPH EDGES:", cleanEdges.length)

  return {
    nodes: cleanNodes,
    links: cleanEdges,
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