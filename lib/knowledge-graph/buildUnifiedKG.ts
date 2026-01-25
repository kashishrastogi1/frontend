import { RawKG, UnifiedKG, UnifiedNode, UnifiedEdge } from "./types"

export function buildUnifiedKG(
  techGraphs: { tech: string; kg: RawKG }[]
): UnifiedKG {
  const nodeMap = new Map<string, UnifiedNode>()
  const edges: UnifiedEdge[] = []

  techGraphs.forEach(({ tech, kg }) => {
    kg.nodes.forEach((node) => {
      const existing = nodeMap.get(node.id)

      if (!existing) {
        nodeMap.set(node.id, {
          id: node.id,
          label: node.id,
          type: node.type,

          // ✅ IMPORTANT: propagate URL if present
          url: node.url && node.url.startsWith("http")
            ? node.url
            : undefined,

          techs: [tech],
          techCount: 1,
          level: node.type === "technology" ? 0 : 1,
        })
      } else {
        if (!existing.techs.includes(tech)) {
          existing.techs.push(tech)
          existing.techCount = existing.techs.length
        }

        // ✅ If URL was missing earlier but found now, attach it
        if (!existing.url && node.url?.startsWith("http")) {
          existing.url = node.url
        }
      }
    })

    kg.edges.forEach((edge, i) => {
      edges.push({
        id: `${tech}-${i}-${edge.source}-${edge.target}`,
        source: edge.source,
        target: edge.target,
        relation: edge.relation,
        tech,
      })
    })
  })

  return {
    nodes: [...nodeMap.values()],
    edges,
  }
}
