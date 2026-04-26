"use client";

import { useEffect } from "react";

import { StatusPage } from "@/app/status-page";

/**
 * Next.js error-boundary payload for the global app error page.
 */
interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global 500 error boundary rendered by Next.js when an unhandled runtime error occurs.
 * @param props - The current runtime error and the reset callback supplied by Next.js.
 * @returns The shared status page configured for unrecoverable app errors.
 */
export default function Error(props: ErrorPageProps) {
  const { error, reset } = props;

  useEffect(() => {
    console.error("Global error handler:", error);
  }, [error]);

  return (
    <StatusPage
      actions={[
        {
          label: "Try again",
          onClick: reset,
          tone: "primary",
        },
        {
          href: "/",
          label: "Go home",
          tone: "secondary",
        },
      ]}
      code="500"
      description={
        process.env.NODE_ENV === "development"
          ? error.message
          : "An unexpected error occurred. Please try again."
      }
      headline="Something went wrong"
    />
  );
}
