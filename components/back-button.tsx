"use client";

import { useRouter, usePathname } from "next/navigation";

export function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // ❌ Don't show on home
  if (pathname === "/") return null;

  return (
    <button
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push("/");
      }}
      className="text-sm text-muted-foreground hover:text-foreground transition"
    >
      ← Back
    </button>
  );
}
