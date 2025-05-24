import React from "react";

interface ErrorStateProps {
  error: unknown;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg border border-red-200">
      <div className="flex flex-col items-center space-y-4 text-center p-6">
        <div className="text-red-500">
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.312 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-red-900">
            Failed to load KPI data
          </h3>
          <p className="text-red-700 text-sm mt-1">
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred"}
          </p>
        </div>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};
