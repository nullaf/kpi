import type { KpiDataPoint, Threshold } from "./types";

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const calculateYAxisDomain = (
  data: KpiDataPoint[],
  thresholds: Threshold[],
): [number, number] => {
  const values = data.map((d) => d.revenue);
  const visibleThresholdValues = thresholds
    .filter((t) => t.isVisible)
    .map((t) => t.value);

  const allValues = [...values, ...visibleThresholdValues];
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const padding = (max - min) * 0.15;

  return [Math.max(0, min - padding), max + padding];
};

export const snapToInteger = (value: number): number => {
  // Snap to nearest 1000
  return Math.round(value / 1000) * 1000;
};

export const getContrastColor = (hexColor: string): string => {
  // Remove # if present
  const hex = hexColor.replace("#", "");

  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? "#000000" : "#ffffff";
};
