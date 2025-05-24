import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { KpiDataPoint } from "@/components/KpiThresholdChart/types";

const fetchKpiData = async (): Promise<KpiDataPoint[]> => {
  const response = await fetch("/api/kpis");
  if (!response.ok) {
    throw new Error("Failed to fetch KPI data");
  }
  return response.json();
};

const refreshKpiData = async (): Promise<KpiDataPoint[]> => {
  const response = await fetch("/api/kpis", { method: "POST" });
  if (!response.ok) {
    throw new Error("Failed to refresh KPI data");
  }
  return response.json();
};

export const useKpiData = () => {
  return useQuery({
    queryKey: ["kpiData"],
    queryFn: fetchKpiData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useRefreshKpiData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refreshKpiData,
    onSuccess: (data) => {
      queryClient.setQueryData(["kpiData"], data);
    },
  });
};
