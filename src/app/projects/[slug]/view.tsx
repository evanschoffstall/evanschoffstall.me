"use client";

import { useEffect } from "react";

export function ReportView({ slug }: { slug: string }) {
  useEffect(() => {
    fetch("/api/incr", {
      method: "POST",
      keepalive: true,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ slug }),
    }).catch(() => {
      // Silently ignore analytics reporting failures to prevent user-facing errors
    });
  }, [slug]);

  return null;
}
