"use client"
import React from "react"

export default function PublicationList({ papers, onSelect }: any) {

  return (
    <div className="space-y-2">

      {papers.map((paper: any, i: number) => (

        <div
          key={i}
          onClick={() => onSelect(paper)}
          className="p-2 rounded-md border border-border/30 bg-secondary/30 cursor-pointer hover:bg-muted transition"
        >
          <p className="text-sm font-medium line-clamp-2">
            {paper.title}
          </p>
        </div>

      ))}

    </div>
  )
}
