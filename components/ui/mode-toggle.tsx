"use client"

type Mode = "technology" | "local"

export default function ModeToggle({
  mode,
  setMode,
}: {
  mode: Mode
  setMode: (m: Mode) => void
}) {
  return (
    <div className="flex items-center gap-3">
      {/* LEFT: Local Mode */}
      <span
        className={`text-sm transition-colors ${mode === "local" ? "font-semibold text-foreground" : "text-muted-foreground"
          }`}
      >
        Local Mode
      </span>

      <button
        onClick={() => setMode(mode === "technology" ? "local" : "technology")}
        className={`relative w-14 h-7 rounded-full transition-colors ${mode === "technology" ? "bg-primary" : "bg-muted"
          }`}
      >
        <span
          className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-background shadow-sm transition-transform ${mode === "technology" ? "translate-x-7" : "translate-x-0"
            }`}
        />
      </button>

      {/* RIGHT: Technology Mode */}
      <span
        className={`text-sm transition-colors ${mode === "technology" ? "font-semibold text-foreground" : "text-muted-foreground"
          }`}
      >
        Technology Mode
      </span>
    </div>
  )
}