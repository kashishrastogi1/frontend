// components/knowledge-graph/kgStyles.ts

const TECH_COLOR_MAP: Record<string, string> = {}
const PALETTE = [
  "#2563eb", // blue
  "#16a34a", // green
  "#dc2626", // red
  "#7c3aed", // purple
  "#ea580c", // orange
  "#0891b2", // cyan
  "#ca8a04", // yellow
  "#be185d", // pink
]

function hashTech(tech: string) {
  let h = 0
  for (let i = 0; i < tech.length; i++) {
    h = (h << 5) - h + tech.charCodeAt(i)
  }
  return Math.abs(h)
}

export function getTechColorByName(tech: string) {
  if (!TECH_COLOR_MAP[tech]) {
    TECH_COLOR_MAP[tech] =
      PALETTE[hashTech(tech) % PALETTE.length]
  }
  return TECH_COLOR_MAP[tech]
}

export function getNodeColor(techs: string[]) {
  // single tech → that color
  if (techs.length === 1) {
    return getTechColorByName(techs[0])
  }

  // shared entity → neutral highlight
  return "#f59e0b" // amber for shared
}

export function getNodeShape(type: string) {
  switch (type) {
    case "technology":
      return "diamond"
    case "patent":
      return "box"
    case "paper":
      return "ellipse"
    case "company":
      return "triangle"
    case "country":
      return "hexagon"
    default:
      return "dot"
  }
}
