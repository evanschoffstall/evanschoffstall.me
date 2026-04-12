"use client";

import { useEffect } from "react";

import { StatusPage } from "./status-page";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/** Global 500 error boundary rendered by Next.js when an unhandled runtime error occurs. */
export default function Error({ error, reset }: ErrorPageProps) {
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
