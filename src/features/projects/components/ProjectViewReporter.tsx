"use client";

import { useEffect } from "react";

const ANALYTICS_ENDPOINT = "/api/views";
const JSON_CONTENT_TYPE = "application/json";
const REQUEST_IDLE_TIMEOUT_MS = 1000;
const REQUEST_IDLE_FALLBACK_MS = 250;

interface ProjectViewReporterProps {
  slug: string;
}

/**
 * Reports a project page view after the current page has become idle.
 * @param props - The project slug to send to the views API.
 * @returns `null` because the reporter performs side effects only.
 */
export function ProjectViewReporter(props: ProjectViewReporterProps) {
  const { slug } = props;

  useEffect(() => {
    let isCanceled = false;
    const requestBody = JSON.stringify({ slug });

    /**
     * Sends the view-report request once the browser is idle enough to avoid user-visible impact.
     */
    const reportView = () => {
      if (isCanceled) {
        return;
      }

      if (typeof navigator.sendBeacon === "function") {
        const payload = new Blob([requestBody], { type: JSON_CONTENT_TYPE });
        if (navigator.sendBeacon(ANALYTICS_ENDPOINT, payload)) {
          return;
        }
      }

      fetch(ANALYTICS_ENDPOINT, {
        body: requestBody,
        headers: {
          "Content-Type": JSON_CONTENT_TYPE,
        },
        keepalive: true,
        method: "POST",
      }).catch(() => {
        // Silently ignore analytics reporting failures to prevent user-facing errors.
      });
    };

    if (hasRequestIdleCallback()) {
      const idleCallbackId = window.requestIdleCallback(reportView, {
        timeout: REQUEST_IDLE_TIMEOUT_MS,
      });

      return () => {
        isCanceled = true;
        window.cancelIdleCallback(idleCallbackId);
      };
    }

    const timeoutId = window.setTimeout(reportView, REQUEST_IDLE_FALLBACK_MS);

    return () => {
      isCanceled = true;
      window.clearTimeout(timeoutId);
    };
  }, [slug]);

  return null;
}

/**
 * Checks whether the browser exposes `requestIdleCallback`.
 * @returns `true` when idle callbacks are available in the current browser.
 */
function hasRequestIdleCallback(): boolean {
  return typeof window.requestIdleCallback === "function";
}
