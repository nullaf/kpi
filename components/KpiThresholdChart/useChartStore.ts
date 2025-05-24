import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { ChartState } from "./types"

export const useChartStore = create<ChartState>()(
  persist(
    (set) => ({
      thresholds: [],
      annotations: {},

      addThreshold: (threshold) => {
        const id = `threshold-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        set((state) => ({
          thresholds: [...state.thresholds, { ...threshold, id }],
        }))
      },

      updateThreshold: (id, updates) => {
        set((state) => ({
          thresholds: state.thresholds.map((threshold) =>
            threshold.id === id ? { ...threshold, ...updates } : threshold,
          ),
        }))
      },

      deleteThreshold: (id) => {
        set((state) => ({
          thresholds: state.thresholds.filter((threshold) => threshold.id !== id),
        }))
      },

      addAnnotation: (annotation) => {
        const id = `annotation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        set((state) => ({
          annotations: {
            ...state.annotations,
            [id]: { ...annotation, id },
          },
        }))
      },

      updateAnnotation: (id, updates) => {
        set((state) => ({
          annotations: {
            ...state.annotations,
            [id]: { ...state.annotations[id], ...updates },
          },
        }))
      },

      deleteAnnotation: (id) => {
        set((state) => {
          const { [id]: deleted, ...rest } = state.annotations
          return { annotations: rest }
        })
      },
    }),
    {
      name: "kpi-chart-storage",
      version: 1,
    },
  ),
)
