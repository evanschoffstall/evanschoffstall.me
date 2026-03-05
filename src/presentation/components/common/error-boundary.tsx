"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch React errors and display fallback UI.
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary fallback={<ErrorFallback />}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // In production, send to error tracking service (e.g., Sentry)
    if (process.env.NODE_ENV === "production") {
      // TODO: Send to error tracking service
      // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center min-h-screen bg-black text-zinc-100">
            <div className="text-center space-y-4 p-8">
              <h1 className="text-2xl font-bold">Something went wrong</h1>
              <p className="text-zinc-400">
                An error occurred while rendering this page.
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors"
              >
                Reload page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
