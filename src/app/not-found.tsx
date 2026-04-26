"use client";

import { StatusPage } from "@/app/status-page";

/**
 * 404 not-found boundary rendered by Next.js for unmatched routes.
 * @returns The shared status page configured for missing routes.
 */
export default function NotFound() {
  return (
    <StatusPage
      actions={[
        {
          href: "/",
          label: "Go home",
          tone: "primary",
        },
      ]}
      code="404"
      description="This path doesn't exist or has been moved."
      headline="Page not found"
    />
  );
}
