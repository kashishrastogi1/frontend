"use client"

type TechStatus = "ready" | "processing" | "missing"

interface TechPanelProps {
  tech: string
  status?: TechStatus
  onTrigger?: (tech: string) => void
}

export function TechPanel({
  tech,
  status = "missing",
  onTrigger,
}: TechPanelProps) {
  return (
    <div className="border rounded-lg p-5">
      <h2 className="text-xl font-semibold mb-2 capitalize">
        {tech}
      </h2>

      {status === "ready" && (
        <p className="text-green-600 text-sm">
          Analysis available
        </p>
      )}

      {status === "processing" && (
        <p className="text-yellow-600 text-sm">
          Analysis in progress…
        </p>
      )}

      {status === "missing" && (
        <>
          <p className="text-muted-foreground text-sm mb-3">
            Analysis not generated yet
          </p>

          <button
            className="border border-border px-3 py-1.5 rounded-md text-sm hover:bg-muted transition"
            onClick={() => onTrigger?.(tech)}
          >
            Generate analysis
          </button>
        </>
      )}
    </div>
  )
}
