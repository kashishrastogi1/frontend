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

  /* ---------------- VISIBLE DATA ---------------- */
  const visibleNodes = useMemo(() => nodes.filter((n) => !n.hidden), [nodes])
  const visibleEdges = useMemo(() => edges.filter((e) => !e.hidden), [edges])

  /* ---------------- GRAPH DATA ---------------- */
  const graphData = useMemo(() => {
    const norm = (v: any) =>
      String(v ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_")

    const nodeIds = new Set(visibleNodes.map((n) => norm(n.id)))

    const cleanNodes = visibleNodes.map((n) => {
      const id = norm(n.id)
      const isTech = n.type.toLowerCase() === "technology"

      return {
        id,
        type: n.type,
        url: n.url,

        // 🔥 PIN CENTRAL TECHNOLOGY NODE
        fx: isTech ? 0 : undefined,
        fy: isTech ? 0 : undefined,
      }
    })

    const cleanEdges = visibleEdges
      .map((e) => ({
        source: norm(e.source),
        target: norm(e.target),
        relation: e.relation,
      }))
      .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))

    return {
      nodes: cleanNodes,
      links: cleanEdges,
    }
  }, [visibleNodes, visibleEdges])

  /* ---------------- PHYSICS CONFIG ---------------- */
  useEffect(() => {
    if (!fgRef.current) return

    // Repulsion force (controls scatter)
    fgRef.current.d3Force("charge")?.strength(-120)

    // Link distance control
    fgRef.current.d3Force("link")?.distance(80)
  }, [graphData])

  /* ---------------- AUTO FIT ---------------- */
  useEffect(() => {
    if (!fgRef.current) return
    const t = setTimeout(() => {
      fgRef.current.zoomToFit(600, 140)
    }, 500)
    return () => clearTimeout(t)
  }, [graphData])

  /* ---------------- RENDER ---------------- */
  return (
    <div className="h-[520px] w-full rounded-lg border bg-background overflow-hidden">
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}

        nodeAutoColorBy="type"
        nodeRelSize={6}

        d3VelocityDecay={0.35}
        d3AlphaDecay={0.02}

        nodeLabel={(n: any) => `${n.id} (${n.type})`}
        linkLabel={(l: any) => l.relation}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        linkColor={() => "#9ca3af"}

        cooldownTicks={250}

        onEngineStop={() => {
          fgRef.current?.zoomToFit(600, 140)
        }}

        onNodeClick={(node: any) => {
          if (node.url) window.open(node.url, "_blank")
        }}
      />
    </div>
  )
}
