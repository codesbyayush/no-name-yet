/**
 * Extract subdomain from host header
 * Handles various formats:
 * - "app.example.com" -> "app"
 * - "subdomain.example.com:3000" -> "subdomain"
 * - "localhost:3000" -> null
 */
export function extractSubdomainFromHost(host: string): string | null {
  if (!host || host.startsWith('localhost')) {
    return null;
  }

  // Remove port if present
  const cleanHost = host.includes(':') ? host.split(':')[0] : host;

  const parts = cleanHost.split('.');
  if (parts.length < 2) {
    return null;
  } else if (parts.length === 2 && parts[1] !== 'localhost') {
    return null;
  }

  const candidate = parts[0];
  // Skip common prefixes
  if (candidate === 'www' || candidate === 'api') {
    return null;
  }

  return candidate;
}

/**
 * Extract subdomain from origin header
 * Handles formats like "https://subdomain.example.com"
 */
export function extractSubdomainFromOrigin(origin: string): string | null {
  if (!origin) {
    return null;
  }

  try {
    const url = new URL(origin);
    return extractSubdomainFromHost(url.host);
  } catch {
    return null;
  }
}
