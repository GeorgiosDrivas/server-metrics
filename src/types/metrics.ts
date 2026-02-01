export interface RequestMetric {
  id: string;
  ip: string;
  method: string;
  path: string;
  status: number;
  responseTimeMs: number;
  timestamp: number;
}

export interface MetricsSummary {
  totalRequests: number;
  avgResponseTime: number;
  errorRate: number;
  requestsPerMinute: number;
}

export interface TimeSeriesData {
  time: string;
  requests: number;
  avgResponseTime: number;
  errors: number;
}

export interface StatusCodeData {
  status: string;
  count: number;
  color: string;
}

export interface EndpointData {
  path: string;
  method: string;
  count: number;
  avgResponseTime: number;
}

export interface MethodData {
  method: string;
  count: number;
  color: string;
}
