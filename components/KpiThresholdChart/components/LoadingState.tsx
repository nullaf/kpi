import React from "react";

interface LoadingStateProps {}

export const LoadingState: React.FC<LoadingStateProps> = () => {
  return (
    <div className="flex items-center justify-center h-96 bg-slate-50 rounded-lg border border-slate-200">
      <div className="flex flex-col items-center space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-slate-600 text-sm">Loading KPI data...</p>
      </div>
    </div>
  );
};
