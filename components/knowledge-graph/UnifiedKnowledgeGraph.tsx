"use client"

import { useEffect, useRef } from "react"
import { Network } from "vis-network/standalone"
import { DataSet } from "vis-data"

import {
  getNodeColor,
  getNodeShape,
  getTechColorByName,
} from "./kgStyles"

/* ================= TYPES ================= */

type Node = {
  id: string
  label: string
  type: string
  techs: string[]
  techCount: number
  url?: string
}

type Edge = {
  source: string
  target: string
  relation: string
}

/* vis-network specific types */
type VisNode = {
  id: string
  label: string
  shape: string
  color: {
    background: string
    border: string
  }
  url?: string
  title?: string
}

type VisEdge = {
  from: string
  to: string
  arrows?: string
  color?: string
  title?: string
  smooth?: boolean
}

/* ================= COMPONENT ================= */

export function UnifiedKnowledgeGraph({
  nodes,
  edges,
}: {
  nodes: Node[]
  edges: Edge[]
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    /* ---------- NODES ---------- */
    const nodesDataset = new DataSet<VisNode>(
      nodes.map((n) => ({
        id: n.id,
        label: "", 
        shape: getNodeShape(n.type),
        color: {
          background: getNodeColor(n.techs),
          border: "#111827",
        },
        url: n.url,
        title: `${n.label}
Type: ${n.type}
Technologies: ${n.techs.join(", ")}
Shared by: ${n.techCount} tech`,
      }))
    )

    /* ---------- EDGES ---------- */
   const edgesDataset = new DataSet(
    edges.map((e, idx) => ({
      id: `${e.source}-${e.target}-${idx}`, // ✅ add id
      from: e.source,
      to: e.target,
      arrows: "to",
      color: "#9ca3af",
      title: e.relation,
      smooth: true,
    }))
  )


    /* ---------- NETWORK ---------- */
    const network = new Network(
      containerRef.current,
      {
        nodes: nodesDataset,
        edges: edgesDataset,
      },
      {
        interaction: {
          hover: true,
        },
        nodes: {
          borderWidth: 1,
        },
        physics: {
          stabilization: true,
          barnesHut: {
            gravitationalConstant: -4000,
            springLength: 140,
          },
        },
      }
    )

    /* ---------- CLICK → OPEN URL ---------- */
    network.on("selectNode", (params) => {
      const nodeId = params.nodes[0] as string

      const originalNode = nodes.find((n) => n.id === nodeId)

      console.log("Clicked node:", originalNode)

      if (originalNode?.url) {
        window.open(originalNode.url, "_blank", "noopener,noreferrer")
      } else {
        console.warn(" No URL found for this node:", nodeId)
      }
    })


    

    return () => network.destroy()
  }, [nodes, edges])

  return (
    <>
      {/* ================= LEGEND ================= */}
<div className="flex flex-col gap-3 text-sm mb-4">
  {/* Technologies */}
  <div className="flex items-center gap-4 flex-wrap">
    <span className="font-medium text-muted-foreground">
      Technologies
    </span>

    <div className="flex items-center gap-3 flex-wrap">
      {Array.from(new Set(nodes.flatMap((n) => n.techs))).map((t) => (
        <div key={t} className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: getTechColorByName(t) }}
          />
          <span className="text-muted-foreground">{t}</span>
        </div>
      ))}
    </div>
  </div>

  {/* Entities */}
  <div className="flex items-center gap-4 flex-wrap">
    <span className="font-medium text-muted-foreground">
      Entities
    </span>

    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rotate-45 border border-muted-foreground" />
        <span>Technology</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 border border-muted-foreground" />
        <span>Patent</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground" />
        <span>Paper</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-muted-foreground" />
        <span>Company</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rotate-45 bg-muted-foreground" />
        <span>Country</span>
      </div>
    </div>
  </div>
</div>

{/* ================= GRAPH ================= */}
<div
  ref={containerRef}
  className="w-full h-[600px] border rounded-md"
/>

    </>
  )
}
