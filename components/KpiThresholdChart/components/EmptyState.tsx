import React from "react";

interface EmptyStateProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onRefresh,
  isRefreshing,
}) => {
  return (
    <div className="flex items-center justify-center h-96 bg-slate-50 rounded-lg border border-slate-200">
      <div className="flex flex-col items-center space-y-3 text-center p-6">
        <div className="text-slate-400">
          <svg
            className="w-12 h-12 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            No data available
          </h3>
          <p className="text-slate-600 text-sm mt-1">
            There's no KPI data to display at the moment.
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          disabled={isRefreshing}
        >
          {isRefreshing ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>
    </div>
  );
};
