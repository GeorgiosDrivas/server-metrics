import { useState, useEffect, useCallback } from "react";
import type {
  RequestMetric,
  MetricsSummary,
  TimeSeriesData,
  StatusCodeData,
  EndpointData,
  MethodData,
} from "@/types/metrics";
import {
  generateTimeSeriesData,
  generateStatusCodeData,
  generateEndpointData,
  generateMethodData,
  calculateSummary,
} from "@/lib/mockData";

const API_URL = "http://localhost:3000/metrics";

export function useMetrics() {
  const [metrics, setMetrics] = useState<RequestMetric[]>([]);
  const [summary, setSummary] = useState<MetricsSummary>({
    totalRequests: 0,
    avgResponseTime: 0,
    errorRate: 0,
    requestsPerMinute: 0,
  });
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [statusCodeData, setStatusCodeData] = useState<StatusCodeData[]>([]);
  const [endpointData, setEndpointData] = useState<EndpointData[]>([]);
  const [methodData, setMethodData] = useState<MethodData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newMetrics: RequestMetric[] = await response.json();
      const metricsWithIds = newMetrics.map((m, index) => ({
        ...m,
        id: `req-${index}-${m.timestamp}`,
      }));

      setMetrics(metricsWithIds);
      setSummary(calculateSummary(metricsWithIds));
      setTimeSeriesData(generateTimeSeriesData(metricsWithIds));
      setStatusCodeData(generateStatusCodeData(metricsWithIds));
      setEndpointData(generateEndpointData(metricsWithIds));
      setMethodData(generateMethodData(metricsWithIds));
    } catch (err) {
      console.error("Failed to fetch metrics:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch metrics");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, [refreshData]);

  return {
    metrics,
    summary,
    timeSeriesData,
    statusCodeData,
    endpointData,
    methodData,
    isLoading,
    error,
    refreshData,
  };
}
