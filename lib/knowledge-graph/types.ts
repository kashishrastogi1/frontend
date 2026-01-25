export type RawKG = {
  nodes: {
    id: string
    type: string
    url?: string | null
  }[]
  edges: {
    source: string
    target: string
    relation: string
  }[]
}

export type UnifiedNode = {
  id: string
  label: string
  type: string
  techs: string[]
  techCount: number
  level: number
  url?: string
}

export type UnifiedEdge = {
  id: string
  source: string
  target: string
  relation: string
  tech: string
}

export type UnifiedKG = {
  nodes: UnifiedNode[]
  edges: UnifiedEdge[]
}
