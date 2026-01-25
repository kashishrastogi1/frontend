import { KGFilters } from "./types"

export function filterKnowledgeGraph(kg: any, filters: KGFilters) {
  if (!kg?.nodes || !kg?.edges) return kg

  // 1️⃣ Mark node visibility
  const nodes = kg.nodes.map((n: any) => {
    const typeAllowed = filters.nodeTypes[n.type as keyof typeof filters.nodeTypes]
    const keywordAllowed = filters.keyword
      ? n.id.toLowerCase().includes(filters.keyword.toLowerCase())
      : true

    return {
      ...n,
      hidden: !(typeAllowed && keywordAllowed),
    }
  })

  const visibleNodeIds = new Set(
    nodes.filter((n: any) => !n.hidden).map((n: any) => n.id)
  )

  // 2️⃣ Mark edge visibility
  const edges = kg.edges.map((e: any) => {
    const relationAllowed =
      filters.relations[e.relation as keyof typeof filters.relations]

    const nodesVisible =
      visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)

    return {
      ...e,
      hidden: !(relationAllowed && nodesVisible),
    }
  })

  return {
    ...kg,
    nodes,
    edges,
  }
}
