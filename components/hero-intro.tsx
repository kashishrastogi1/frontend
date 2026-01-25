"use client"

import Image from "next/image"

export function HeroIntro() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

        {/* LEFT CONTENT */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Technology Intelligence <br />
            <span className="text-primary">for Strategic Decisions</span>
          </h1>

          <p className="mt-4 text-lg text-muted-foreground max-w-xl">
            TechIntel helps you track emerging technologies, analyze patent
            activity, monitor investments, and stay ahead of global innovation
            trends — all in one platform.
          </p>
        </div>

        {/* RIGHT IMAGE GRID */}
        <div className="grid grid-cols-2 gap-4">
          <Image
            src="/images/ai.jpg"
            alt="AI Intelligence"
            width={400}
            height={250}
            className="rounded-xl object-cover"
          />
          <Image
            src="/images/patents.png"
            alt="Patent Analysis"
            width={400}
            height={250}
            className="rounded-xl object-cover"
          />
          <Image
            src="/images/investments.jpeg"
            alt="Investment Trends"
            width={400}
            height={250}
            className="rounded-xl object-cover"
          />
          <Image
            src="/images/global.jpg"
            alt="Global Technology"
            width={400}
            height={250}
            className="rounded-xl object-cover"
          />
        </div>
      </div>
    </section>
  )
}
