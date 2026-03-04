"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error handler:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-zinc-100">
      <div className="text-center space-y-6 p-8 max-w-md">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-display">Oops!</h1>
          <h2 className="text-xl text-zinc-400">Something went wrong</h2>
        </div>

        <p className="text-zinc-500 text-sm">
          {process.env.NODE_ENV === "development" ? (
            <>Error: {error.message}</>
          ) : (
            <>An unexpected error occurred. Please try again.</>
          )}
        </p>

        <div className="flex gap-4 justify-center">
          <button
            type="button"
            onClick={reset}
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors font-medium"
          >
            Try again
          </button>
          <a
            href="/"
            className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-colors font-medium"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
