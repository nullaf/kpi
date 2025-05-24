import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { formatCurrency } from "../utils";
import { AnnotationPopover } from "../AnnotationPopover";
import type { Threshold } from "../types";

interface ChartVisualizationProps {
  kpiData: any[];
  yAxisDomain: [number, number];
  visibleThresholds: Threshold[];
  showThresholds: boolean;
  thresholdPositions: Map<string, { x: number; y: number }>;
  annotations: Record<string, any>;
  onChartDoubleClick: (event: React.MouseEvent) => void;
  onThresholdMouseDown: (thresholdId: string, event: React.MouseEvent) => void;
  calculateAnnotationPosition: (
    annotation: { dataPointIndex: number },
    chartContainer: HTMLElement,
  ) => { x: number; y: number };
  chartContainerRef: React.RefObject<HTMLDivElement>;
}

export const ChartVisualization: React.FC<ChartVisualizationProps> = ({
  kpiData,
  yAxisDomain,
  visibleThresholds,
  showThresholds,
  thresholdPositions,
  annotations,
  onChartDoubleClick,
  onThresholdMouseDown,
  calculateAnnotationPosition,
  chartContainerRef,
}) => {
  return (
    <div
      ref={chartContainerRef}
      className="relative bg-slate-50 rounded-lg p-4 border border-slate-200"
      onDoubleClick={onChartDoubleClick}
    >
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={kpiData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#64748b" />
          <YAxis
            domain={yAxisDomain}
            tickFormatter={formatCurrency}
            tick={{ fontSize: 12 }}
            stroke="#64748b"
            width={80}
          />
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), "Revenue"]}
            labelStyle={{ color: "#1e293b" }}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
            wrapperStyle={{ zIndex: 9999 }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
            animationDuration={800}
          />
          {visibleThresholds.map((threshold) => (
            <ReferenceLine
              key={threshold.id}
              y={threshold.value}
              stroke={threshold.color}
              strokeDasharray="8 4"
              strokeWidth={3}
              strokeOpacity={0.8}
              style={{ zIndex: -1 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {showThresholds &&
        visibleThresholds.map((threshold) => {
          const position = thresholdPositions.get(threshold.id) || {
            x: 0,
            y: 0,
          };
          return (
            <div
              key={`handle-${threshold.id}`}
              className={`absolute z-20 flex items-center ${
                threshold.isLocked ? "cursor-default" : "cursor-ns-resize"
              }`}
              style={{
                left: position.x - 48,
                top: position.y - 12,
              }}
              onMouseDown={(e) => onThresholdMouseDown(threshold.id, e)}
              title={`${threshold.name}: ${formatCurrency(threshold.value)}${threshold.isLocked ? " (Locked)" : ""}`}
            >
              <div
                className={`w-4 h-6 rounded-sm border-2 border-white shadow-lg transition-all hover:scale-110 ${
                  threshold.isLocked ? "opacity-60" : "hover:shadow-xl"
                }`}
                style={{ backgroundColor: threshold.color }}
              />
              <div
                className="ml-2 px-2 py-1 rounded text-xs font-semibold text-white shadow-sm whitespace-nowrap"
                style={{ backgroundColor: threshold.color }}
              >
                {threshold.name}
                <div className="text-xs opacity-90">
                  {formatCurrency(threshold.value)}
                </div>
              </div>
            </div>
          );
        })}

      {Object.values(annotations).map((annotation) => (
        <AnnotationPopover
          key={annotation.id}
          annotation={annotation}
          getPosition={() =>
            calculateAnnotationPosition(annotation, chartContainerRef.current!)
          }
        />
      ))}
    </div>
  );
};
