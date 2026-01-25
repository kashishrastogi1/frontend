"use client"

import { useEffect, useState } from "react"
import { TechPanel } from "./tech-panel"

type TechStatus = "ready" | "processing" | "missing"

export function CompareDashboard({ techs }: { techs: string[] }) {
  const [statusMap, setStatusMap] = useState<Record<string, TechStatus>>({})

  async function checkStatus(tech: string) {
    try {
      const res = await fetch(`/api/tech/${tech}`)
      if (res.ok) {
        setStatusMap((prev) => ({
          ...prev,
          [tech]: "ready",
        }))
      }
    } catch {}
  }

  async function triggerAnalysis(tech: string) {
    setStatusMap((prev) => ({
      ...prev,
      [tech]: "processing",
    }))

    await fetch(`/api/tech/${tech}/run`, { method: "POST" })
  }

  // 🔁 POLLING
  useEffect(() => {
    const interval = setInterval(() => {
      techs.forEach((tech) => {
        if (statusMap[tech] === "processing") {
          checkStatus(tech)
        }
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [statusMap, techs])

  return (
    <div className="grid grid-cols-2 gap-6">
      {techs.map((tech) => (
        <TechPanel
          key={tech}
          tech={tech}
          status={statusMap[tech] ?? "missing"}
          onTrigger={triggerAnalysis}
        />
      ))}
    </div>
  )
}
