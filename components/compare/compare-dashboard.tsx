"use client"

import { BACKEND_URL } from "@/lib/utils/api"
import { useEffect, useState } from "react"
import { TechPanel } from "./tech-panel"

type TechStatus = "ready" | "processing" | "missing"

export function CompareDashboard({ techs }: { techs: string[] }) {
  const [statusMap, setStatusMap] = useState<Record<string, TechStatus>>({})

  async function checkStatus(tech: string) {
    if (!tech) return

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/technology/${tech}`
      )

      if (!res.ok) {
        setStatusMap((p) => ({ ...p, [tech]: "missing" }))
        return
      }

      const text = await res.text()

      if (text.startsWith("<")) {
        setStatusMap((p) => ({ ...p, [tech]: "missing" }))
        return
      }

      const json = JSON.parse(text)

      // ✅ Backend-controlled status
      const status: TechStatus =
        json.status === "processing"
          ? "processing"
          : "ready"

      setStatusMap((p) => ({ ...p, [tech]: status }))
    } catch {
      setStatusMap((p) => ({ ...p, [tech]: "missing" }))
    }
  }

  // 🔁 Poll backend (backend-only ML)
  useEffect(() => {
    techs.forEach((tech) => {
      checkStatus(tech)
    })

    const interval = setInterval(() => {
      techs.forEach((tech) => {
        if (statusMap[tech] === "processing") {
          checkStatus(tech)
        }
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [techs, statusMap])

  return (
    <div className="grid grid-cols-2 gap-6">
      {techs.map((tech) => (
        <TechPanel
          key={tech}
          tech={tech}
          status={statusMap[tech] ?? "processing"}
        />
      ))}
    </div>
  )
}
