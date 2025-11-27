// API Configuration
// Production: Uses actual AWS API Gateway URL
// Development: Uses Vite proxy (/api -> http://localhost:3001)

const getBaseUrl = (): string => {
  // Production mode: Use environment variable or fallback to deployed API
  if (import.meta.env.MODE === 'production') {
    return import.meta.env.VITE_API_URL || '';
  }

  // Development mode: Use Vite proxy
  return '';
};

export const API_BASE_URL = getBaseUrl();

/**
 * Get full API URL for an endpoint
 * @param endpoint - API endpoint (e.g., '/search' or 'search')
 * @returns Full URL (e.g., 'https://xxx.amazonaws.com/prod/api/search' or '/api/search')
 */
export function getApiUrl(endpoint: string): string {
  // Normalize endpoint (remove leading slash)
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

  // Production: Use full AWS URL
  if (import.meta.env.MODE === 'production' && API_BASE_URL) {
    return `${API_BASE_URL}/api/${cleanEndpoint}`;
  }

  // Development: Use Vite proxy
  return `/api/${cleanEndpoint}`;
}
