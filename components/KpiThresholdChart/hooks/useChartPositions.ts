import { useCallback, useState, useLayoutEffect, useEffect } from "react";
import type { Threshold } from "../types";

export const useChartPositions = (
  visibleThresholds: Threshold[],
  kpiData: any[] | undefined,
  yAxisDomain: [number, number],
  showThresholds: boolean,
) => {
  const [thresholdPositions, setThresholdPositions] = useState(
    new Map<string, { x: number; y: number }>(),
  );

  const calculateThresholdPosition = useCallback(
    (threshold: Threshold, chartContainer: HTMLElement) => {
      if (!chartContainer) return { x: 0, y: 0 };

      const rect = chartContainer.getBoundingClientRect();
      const chartArea = {
        top: 16 + 20,
        bottom: 16 + 20,
        left: 16 + 80,
        right: 16 + 30,
      };

      const chartHeight = rect.height - chartArea.top - chartArea.bottom;
      const [minY, maxY] = yAxisDomain;
      const valuePosition = (threshold.value - minY) / (maxY - minY);
      const yPosition = chartArea.top + chartHeight * (1 - valuePosition);
      const xPosition = chartArea.left - 10;

      return { x: xPosition, y: yPosition };
    },
    [yAxisDomain],
  );

  const calculateAnnotationPosition = useCallback(
    (annotation: { dataPointIndex: number }, chartContainer: HTMLElement) => {
      if (!kpiData || !chartContainer) return { x: 0, y: 0 };

      const rect = chartContainer.getBoundingClientRect();
      const chartArea = {
        top: 16 + 20,
        bottom: 16 + 20,
        left: 16 + 80,
        right: 16 + 30,
      };

      const chartWidth = rect.width - chartArea.left - chartArea.right;
      const chartHeight = rect.height - chartArea.top - chartArea.bottom;

      const dataPoint = kpiData[annotation.dataPointIndex];
      if (!dataPoint) return { x: 0, y: 0 };

      const xPosition =
        chartArea.left +
        (annotation.dataPointIndex / (kpiData.length - 1)) * chartWidth;
      const [minY, maxY] = yAxisDomain;
      const valuePosition = (dataPoint.revenue - minY) / (maxY - minY);
      const yPosition = chartArea.top + chartHeight * (1 - valuePosition);

      return { x: xPosition, y: yPosition };
    },
    [kpiData, yAxisDomain],
  );
  const updatePositions = useCallback(
    (chartContainerRef: React.RefObject<HTMLDivElement | null>) => {
      if (
        !chartContainerRef.current ||
        visibleThresholds.length === 0 ||
        !kpiData
      ) {
        setThresholdPositions(new Map());
        return;
      }

      const positions = new Map<string, { x: number; y: number }>();
      visibleThresholds.forEach((threshold) => {
        positions.set(
          threshold.id,
          calculateThresholdPosition(threshold, chartContainerRef.current!),
        );
      });
      setThresholdPositions(positions);
    },
    [visibleThresholds, calculateThresholdPosition, kpiData],
  );

  return {
    thresholdPositions,
    calculateAnnotationPosition,
    updatePositions,
  };
};
