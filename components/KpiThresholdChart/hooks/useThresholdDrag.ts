import { useCallback } from "react";
import { snapToInteger } from "../utils";
import type { Threshold } from "../types";

export const useThresholdDrag = (
  thresholds: Threshold[],
  updateThreshold: (id: string, updates: Partial<Threshold>) => void,
  yAxisDomain: [number, number],
) => {
  const handleThresholdMouseDown = useCallback(
    (
      thresholdId: string,
      event: React.MouseEvent,
      chartContainerRef: React.RefObject<HTMLDivElement | null>,
    ) => {
      const threshold = thresholds.find((t) => t.id === thresholdId);
      if (!threshold || threshold.isLocked) return;

      event.preventDefault();

      const handleMouseMove = (e: MouseEvent) => {
        if (!chartContainerRef.current) return;

        const rect = chartContainerRef.current.getBoundingClientRect();
        const chartArea = {
          top: 16 + 20,
          bottom: 16 + 20,
        };

        const chartHeight = rect.height - chartArea.top - chartArea.bottom;
        const relativeY = e.clientY - rect.top - chartArea.top;

        const [minY, maxY] = yAxisDomain;
        const normalizedY = 1 - relativeY / chartHeight;
        const newValue = minY + normalizedY * (maxY - minY);

        const snappedValue = snapToInteger(
          Math.max(minY, Math.min(maxY, newValue)),
        );
        updateThreshold(thresholdId, { value: snappedValue });
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [thresholds, updateThreshold, yAxisDomain],
  );

  return { handleThresholdMouseDown };
};
