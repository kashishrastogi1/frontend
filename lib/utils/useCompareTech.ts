import { TechData } from "@/lib/filters/types"

type ProcessingState = {
  status: "processing"
}

export async function fetchTechData(
  tech: string
): Promise<TechData | ProcessingState> {

  const res = await fetch(`http://localhost:3000/api/tech/${tech}`, {
    cache: "no-store",
  })

  // ✅ Case 1: Data exists
  if (res.ok) {
    return res.json()
  }

  // ✅ Case 2: Cache miss → trigger ML
  const body = await res.json()

  if (body?.error?.includes("Cache miss")) {
    // fire-and-forget ML trigger
    await fetch(`http://localhost:3000/api/tech/${tech}/run`, {
      method: "POST",
    })

    return { status: "processing" }
  }

  // ❌ Genuine failure
  throw new Error(`Failed to fetch tech: ${tech}`)
}

export async function fetchMultipleTechs(
  techs: string[]
): Promise<Record<string, TechData | { status: "processing" }>> {

  const results = await Promise.all(
    techs.map(async (tech) => ({
      tech,
      data: await fetchTechData(tech),
    }))
  )

  return results.reduce((acc, { tech, data }) => {
    acc[tech] = data
    return acc
  }, {} as Record<string, TechData | { status: "processing" }>)
}
