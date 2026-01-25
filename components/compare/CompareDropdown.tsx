"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export function CompareDropdown({ baseTech }: { baseTech: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      {/* BUTTON */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="border px-4 py-2 rounded-md bg-background hover:bg-muted flex items-center gap-2"
      >
        Compare
        <span className="text-xs">▾</span>
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-md border bg-background shadow-lg z-50">
          <button
            className="w-full text-left px-4 py-2 hover:bg-muted"
            onClick={() => {
              router.push(`/compare?base=${baseTech}`)
              setOpen(false)
            }}
          >
            Compare with one technology
          </button>

          <button
            className="w-full text-left px-4 py-2 hover:bg-muted"
            onClick={() => {
              router.push(`/compare/multi?base=${baseTech}`)
              setOpen(false)
            }}
          >
            Multi-tech comparison
          </button>
        </div>
      )}
    </div>
  )
}
