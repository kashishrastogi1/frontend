"use client"

export function TechSelector({
  available,
  selected,
  onChange,
}: {
  available: string[]
  selected: string[]
  onChange: (techs: string[]) => void
}) {
  function toggle(tech: string) {
    onChange(
      selected.includes(tech)
        ? selected.filter((t) => t !== tech)
        : [...selected, tech]
    )
  }

  return (
    <div className="flex gap-2 mb-6 flex-wrap">
      {available.map((tech) => (
        <button
          key={tech}
          onClick={() => toggle(tech)}
          className={`px-3 py-1 rounded border text-sm ${
            selected.includes(tech)
              ? "bg-foreground text-background"
              : "hover:bg-muted"
          }`}
        >
          {tech}
        </button>
      ))}
    </div>
  )
}
