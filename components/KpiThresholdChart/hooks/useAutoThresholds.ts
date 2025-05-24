import { useEffect } from "react";
import { snapToInteger } from "../utils";
import type { Threshold } from "../types";

export const useAutoThresholds = (
  kpiData: any[] | undefined,
  thresholds: Threshold[],
  addThreshold: (threshold: Omit<Threshold, "id">) => void,
  setShowThresholds: (show: boolean) => void,
) => {
  useEffect(() => {
    if (kpiData && kpiData.length > 0 && thresholds.length === 0) {
      const revenues = kpiData.map((d) => d.revenue);
      const minRevenue = Math.min(...revenues);
      const avgRevenue =
        revenues.reduce((sum, r) => sum + r, 0) / revenues.length;
      const variance =
        revenues.reduce((sum, r) => sum + Math.pow(r - avgRevenue, 2), 0) /
        revenues.length;
      const stdDev = Math.sqrt(variance);

      const thresholdsToAdd = [
        {
          name: "Performance Target",
          value: snapToInteger(avgRevenue + stdDev * 0.5),
          color: "#10b981",
          isLocked: false,
          isVisible: true,
        },
        {
          name: "Warning Level",
          value: snapToInteger(avgRevenue - stdDev * 0.5),
          color: "#f59e0b",
          isLocked: false,
          isVisible: true,
        },
        {
          name: "Critical Threshold",
          value: snapToInteger(Math.max(minRevenue * 0.9, avgRevenue - stdDev)),
          color: "#ef4444",
          isLocked: false,
          isVisible: true,
        },
      ];

      thresholdsToAdd.forEach((threshold, index) => {
        setTimeout(() => {
          addThreshold(threshold);
        }, index * 100);
      });

      setTimeout(() => setShowThresholds(true), 500);
    } else if (thresholds.length > 0) {
      setShowThresholds(true);
    }
  }, [kpiData, addThreshold, thresholds.length, setShowThresholds]);
};
