"use client";

import type React from "react";
import {
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useState,
  useLayoutEffect,
} from "react";
import { useChartStore } from "./useChartStore";
import { ThresholdPill } from "./ThresholdPill";
import { useKpiData, useRefreshKpiData } from "@/hooks/useKpiData";
import { calculateYAxisDomain } from "./utils";

// Components
import { LoadingState } from "./components/LoadingState";
import { ErrorState } from "./components/ErrorState";
import { EmptyState } from "./components/EmptyState";
import { ChartHeader } from "./components/ChartHeader";
import { ChartVisualization } from "./components/ChartVisualization";
import { ChartStats } from "./components/ChartStats";

// Hooks
import { useChartPositions } from "./hooks/useChartPositions";
import { useThresholdDrag } from "./hooks/useThresholdDrag";
import { useAutoThresholds } from "./hooks/useAutoThresholds";

export const KpiThresholdChart: React.FC = () => {
  const {
    thresholds,
    annotations,
    updateThreshold,
    addAnnotation,
    addThreshold,
  } = useChartStore();
  const chartContainerRef = useRef<HTMLDivElement>(null!);
  const { data: kpiData, isLoading, error, refetch } = useKpiData();
  const refreshKpiData = useRefreshKpiData();
  const [showThresholds, setShowThresholds] = useState(false);

  // Auto-generate intelligent thresholds on first load
  useAutoThresholds(kpiData, thresholds, addThreshold, setShowThresholds);

  const yAxisDomain = useMemo((): [number, number] => {
    if (!kpiData || kpiData.length === 0) return [0, 1000000];
    return calculateYAxisDomain(kpiData, thresholds);
  }, [kpiData, thresholds]);

  const visibleThresholds = useMemo(
    () => thresholds.filter((t) => t.isVisible),
    [thresholds],
  );

  // Use position hooks
  const { thresholdPositions, calculateAnnotationPosition, updatePositions } =
    useChartPositions(visibleThresholds, kpiData, yAxisDomain, showThresholds);

  // Use threshold drag hook
  const { handleThresholdMouseDown } = useThresholdDrag(
    thresholds,
    updateThreshold,
    yAxisDomain,
  );

  useLayoutEffect(() => {
    updatePositions(chartContainerRef);
  }, [updatePositions]);

  useEffect(() => {
    if (showThresholds) {
      const timer = setTimeout(() => updatePositions(chartContainerRef), 150);
      return () => clearTimeout(timer);
    }
  }, [showThresholds, updatePositions]);

  useEffect(() => {
    const handleResize = () => {
      if (chartContainerRef.current && visibleThresholds.length > 0) {
        updatePositions(chartContainerRef);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updatePositions, visibleThresholds.length]);

  const handleChartDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      if (!kpiData || !chartContainerRef.current) return;

      const rect = chartContainerRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const chartArea = {
        left: 16 + 80,
        right: 16 + 30,
      };

      const chartWidth = rect.width - chartArea.left - chartArea.right;
      const dataPointIndex = Math.round(
        ((x - chartArea.left) / chartWidth) * (kpiData.length - 1),
      );
      const clampedIndex = Math.max(
        0,
        Math.min(dataPointIndex, kpiData.length - 1),
      );

      const dataPoint = kpiData[clampedIndex];
      if (!dataPoint) return;

      addAnnotation({
        dataPointIndex: clampedIndex,
        month: dataPoint.month,
        note: "",
        timestamp: Date.now(),
      });
    },
    [addAnnotation, kpiData],
  );

  const wrappedHandleThresholdMouseDown = useCallback(
    (thresholdId: string, event: React.MouseEvent) => {
      handleThresholdMouseDown(thresholdId, event, chartContainerRef);
    },
    [handleThresholdMouseDown],
  );

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => refetch()} />;
  }

  if (!kpiData || kpiData.length === 0) {
    return (
      <EmptyState
        onRefresh={() => refreshKpiData.mutate()}
        isRefreshing={refreshKpiData.isPending}
      />
    );
  }

  return (
    <div className="space-y-6">
      <ChartHeader
        onRefresh={() => refreshKpiData.mutate()}
        isRefreshing={refreshKpiData.isPending}
      />

      {thresholds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {thresholds.map((threshold) => (
            <ThresholdPill key={threshold.id} threshold={threshold} />
          ))}
        </div>
      )}

      <ChartVisualization
        kpiData={kpiData}
        yAxisDomain={yAxisDomain}
        visibleThresholds={visibleThresholds}
        showThresholds={showThresholds}
        thresholdPositions={thresholdPositions}
        annotations={annotations}
        onChartDoubleClick={handleChartDoubleClick}
        onThresholdMouseDown={wrappedHandleThresholdMouseDown}
        calculateAnnotationPosition={calculateAnnotationPosition}
        chartContainerRef={chartContainerRef}
      />

      <ChartStats
        kpiData={kpiData}
        visibleThresholds={visibleThresholds}
        annotations={annotations}
      />
    </div>
  );
};
