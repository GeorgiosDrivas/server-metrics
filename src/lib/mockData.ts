import type {
  RequestMetric,
  TimeSeriesData,
  StatusCodeData,
  EndpointData,
  MethodData,
} from "@/types/metrics";

const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];
const PATHS = [
  "/api/users",
  "/api/users/:id",
  "/api/posts",
  "/api/posts/:id",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/dashboard",
  "/api/settings",
  "/health",
  "/metrics",
];
const STATUS_CODES = [200, 201, 204, 400, 401, 403, 404, 500, 502, 503];
const STATUS_WEIGHTS = [
  0.45, 0.15, 0.1, 0.08, 0.05, 0.03, 0.08, 0.04, 0.01, 0.01,
];

function weightedRandom<T>(items: T[], weights: number[]): T {
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) return items[i];
  }
  return items[0];
}

function generateIP(): string {
  return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}

function generateResponseTime(status: number): number {
  // Error responses tend to be faster or timeout
  if (status >= 500) return Math.random() * 5000 + 2000;
  if (status >= 400) return Math.random() * 100 + 50;
  return Math.random() * 800 + 20;
}

export function generateMockMetrics(count: number = 500): RequestMetric[] {
  const metrics: RequestMetric[] = [];
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;

  for (let i = 0; i < count; i++) {
    const status = weightedRandom(STATUS_CODES, STATUS_WEIGHTS);
    const timestamp = oneHourAgo + Math.random() * (now - oneHourAgo);

    metrics.push({
      id: `req-${i}-${Date.now()}`,
      ip: generateIP(),
      method: METHODS[Math.floor(Math.random() * METHODS.length)],
      path: PATHS[Math.floor(Math.random() * PATHS.length)],
      status,
      responseTimeMs: parseFloat(generateResponseTime(status).toFixed(2)),
      timestamp: Math.floor(timestamp),
    });
  }

  return metrics.sort((a, b) => b.timestamp - a.timestamp);
}

export function generateTimeSeriesData(
  metrics: RequestMetric[],
): TimeSeriesData[] {
  const data: Map<
    string,
    { requests: number; totalResponseTime: number; errors: number }
  > = new Map();

  metrics.forEach((metric) => {
    const date = new Date(metric.timestamp);
    const interval = new Date(
      Math.floor(date.getTime() / (5 * 60 * 1000)) * (5 * 60 * 1000),
    );
    const key = interval.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const existing = data.get(key) || {
      requests: 0,
      totalResponseTime: 0,
      errors: 0,
    };
    existing.requests++;
    existing.totalResponseTime += metric.responseTimeMs;
    if (metric.status >= 400) existing.errors++;
    data.set(key, existing);
  });

  return Array.from(data.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([time, stats]) => ({
      time,
      requests: stats.requests,
      avgResponseTime: parseFloat(
        (stats.totalResponseTime / stats.requests).toFixed(2),
      ),
      errors: stats.errors,
    }));
}

export function generateStatusCodeData(
  metrics: RequestMetric[],
): StatusCodeData[] {
  const statusCount: Map<number, number> = new Map();

  metrics.forEach((metric) => {
    statusCount.set(metric.status, (statusCount.get(metric.status) || 0) + 1);
  });

  const colors: Record<string, string> = {
    "2xx": "#10b981",
    "3xx": "#3b82f6",
    "4xx": "#f59e0b",
    "5xx": "#ef4444",
  };

  const grouped: Map<string, number> = new Map();
  statusCount.forEach((count, status) => {
    const category = `${Math.floor(status / 100)}xx`;
    grouped.set(category, (grouped.get(category) || 0) + count);
  });

  return Array.from(grouped.entries())
    .map(([status, count]) => ({
      status,
      count,
      color: colors[status] || "#6b7280",
    }))
    .sort((a, b) => a.status.localeCompare(b.status));
}

export function generateEndpointData(metrics: RequestMetric[]): EndpointData[] {
  const endpointStats: Map<
    string,
    { count: number; totalResponseTime: number; method: string }
  > = new Map();

  metrics.forEach((metric) => {
    const key = `${metric.method} ${metric.path}`;
    const existing = endpointStats.get(key) || {
      count: 0,
      totalResponseTime: 0,
      method: metric.method,
    };
    existing.count++;
    existing.totalResponseTime += metric.responseTimeMs;
    endpointStats.set(key, existing);
  });

  return Array.from(endpointStats.entries())
    .map(([path, stats]) => ({
      path: path.split(" ")[1],
      method: stats.method,
      count: stats.count,
      avgResponseTime: parseFloat(
        (stats.totalResponseTime / stats.count).toFixed(2),
      ),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

export function generateMethodData(metrics: RequestMetric[]): MethodData[] {
  const methodCount: Map<string, number> = new Map();

  metrics.forEach((metric) => {
    methodCount.set(metric.method, (methodCount.get(metric.method) || 0) + 1);
  });

  const colors: Record<string, string> = {
    GET: "#3b82f6",
    POST: "#10b981",
    PUT: "#f59e0b",
    DELETE: "#ef4444",
    PATCH: "#8b5cf6",
  };

  return Array.from(methodCount.entries())
    .map(([method, count]) => ({
      method,
      count,
      color: colors[method] || "#6b7280",
    }))
    .sort((a, b) => b.count - a.count);
}

export function calculateSummary(metrics: RequestMetric[]) {
  const totalRequests = metrics.length;
  const totalResponseTime = metrics.reduce(
    (sum, m) => sum + m.responseTimeMs,
    0,
  );
  const errorCount = metrics.filter((m) => m.status >= 400).length;

  const timestamps = metrics.map((m) => m.timestamp);
  const minTime = Math.min(...timestamps);
  const maxTime = Math.max(...timestamps);
  const timeRangeMinutes = (maxTime - minTime) / (1000 * 60);
  const requestsPerMinute =
    timeRangeMinutes > 0 ? totalRequests / timeRangeMinutes : 0;

  return {
    totalRequests,
    avgResponseTime: parseFloat((totalResponseTime / totalRequests).toFixed(2)),
    errorRate: parseFloat(((errorCount / totalRequests) * 100).toFixed(2)),
    requestsPerMinute: parseFloat(requestsPerMinute.toFixed(2)),
  };
}
