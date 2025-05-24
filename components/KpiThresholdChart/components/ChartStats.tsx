import React from "react";
import { formatCurrency } from "../utils";
import type { Threshold } from "../types";

interface ChartStatsProps {
  kpiData: any[];
  visibleThresholds: Threshold[];
  annotations: Record<string, any>;
}

export const ChartStats: React.FC<ChartStatsProps> = ({
  kpiData,
  visibleThresholds,
  annotations,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="text-sm text-blue-600 font-medium">Current Revenue</div>
        <div className="text-xl font-bold text-blue-900">
          {formatCurrency(kpiData[kpiData.length - 1]?.revenue || 0)}
        </div>
      </div>

      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
        <div className="text-sm text-green-600 font-medium">Peak Revenue</div>
        <div className="text-xl font-bold text-green-900">
          {formatCurrency(Math.max(...kpiData.map((d) => d.revenue)))}
        </div>
      </div>

      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
        <div className="text-sm text-purple-600 font-medium">
          Active Thresholds
        </div>
        <div className="text-xl font-bold text-purple-900">
          {visibleThresholds.length}
        </div>
      </div>

      <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
        <div className="text-sm text-orange-600 font-medium">Annotations</div>
        <div className="text-xl font-bold text-orange-900">
          {Object.keys(annotations).length}
        </div>
      </div>
    </div>
  );
};
