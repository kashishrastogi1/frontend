"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BACKEND_URL } from "@/lib/utils/api"

/* ---------- Types ---------- */

type SignalType = "publications" | "patents" | "investments";

type SignalItem = {
  title: string
  link?: string
  pdf_link?: string
  year?: number
  academic_weight?: number
  strategic_weight?: number
  confidence_weight?: number
  institute?: string
}


type IndiaPulseData = {
  summary: {
    publications: number;
    patents: number;
    investments: number;
  };
  signals: {
    publications: SignalItem[];
    patents: SignalItem[];
    investments: SignalItem[];
  };
};

/* ---------- Component ---------- */

export function IndiaPulseSection() {
  const [data, setData] = useState<IndiaPulseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SignalType>("publications");

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/india`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setError("India pulse unavailable"));
  }, []);

  if (error) {
    return <p className="text-sm text-red-500 text-center">{error}</p>;
  }

  if (!data) {
    return (
      <p className="text-muted-foreground text-center">
        Loading India tech pulse…
      </p>
    );
  }

  const items = [...data.signals[activeTab]]
    .sort((a, b) => {
      const wa =
        a.academic_weight ?? a.strategic_weight ?? a.confidence_weight ?? 0;
      const wb =
        b.academic_weight ?? b.strategic_weight ?? b.confidence_weight ?? 0;
      return wb - wa;
    })
   

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mt-24 rounded-2xl border bg-background p-8 space-y-10"
    >
      {/* ---------- Header ---------- */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">
          Indian Technology Advancement Metrics
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Curated signals from Indian research, patents, and startup activity.
        </p>
      </div>

      {/* ---------- Clickable Summary ---------- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Stat
          label="Publications"
          value={data.summary.publications}
          active={activeTab === "publications"}
          onClick={() => setActiveTab("publications")}
        />
        <Stat
          label="Patents"
          value={data.summary.patents}
          active={activeTab === "patents"}
          onClick={() => setActiveTab("patents")}
        />
        <Stat
          label="Investments"
          value={data.summary.investments}
          active={activeTab === "investments"}
          onClick={() => setActiveTab("investments")}
        />
      </div>

      {/* ---------- List ---------- */}
      <div
  id="india-pulse-list"
  className="
    grid gap-3
    max-h-[420px]
    overflow-y-auto
    pr-2
    scroll-smooth
    scrollbar-thin
    scrollbar-thumb-muted
    scrollbar-track-transparent
  "
>

        {items.map((item, i) => {
          const href = item.pdf_link || item.link;
          return (
            <div
              key={i}
              className="rounded-lg px-4 py-3 bg-muted/40 hover:bg-muted transition"
            >
              {href ? (
  <div className="overflow-visible">
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="block whitespace-normal break-words font-medium leading-snug hover:underline"
  >
    {item.title}
  </a>
</div>

) : (
  <p className="font-medium leading-snug whitespace-normal break-words">
    {item.title}
  </p>
)}

{/* Institute tag (patents only will have this) */}
{item.institute && (
  <p className="text-xs text-muted-foreground mt-1">
    {item.institute}
  </p>
)}

{item.year && (
  <p className="text-xs text-muted-foreground">
    {item.year}
  </p>
)}

            </div>
          );
        })}
      </div>
    </motion.section>
  );
}

/* ---------- Stat Card ---------- */

function Stat({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border p-5 text-center transition focus:outline-none ${
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-muted/30 hover:bg-muted"
      }`}
    >
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm opacity-80 mt-1">{label}</p>
    </button>
  );
}