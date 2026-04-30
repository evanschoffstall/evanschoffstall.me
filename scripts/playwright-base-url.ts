const DEFAULT_PLAYWRIGHT_HOST = "127.0.0.1";
const DEFAULT_PLAYWRIGHT_PORT = 3100;

/**
 * Build the playwright base url.
 * @param host - The host.
 * @param port - The port.
 * @returns The playwright base url.
 */
export function buildPlaywrightBaseUrl(host: string, port: number) {
  const normalizedHost = host.trim();

  if (!normalizedHost) {
    throw new Error("PLAYWRIGHT_HOST must not be empty.");
  }

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(
      `PLAYWRIGHT_PORT must be a valid TCP port. Received: ${port}`,
    );
  }

  return `http://${normalizedHost}:${port}`;
}

export { DEFAULT_PLAYWRIGHT_HOST, DEFAULT_PLAYWRIGHT_PORT };
