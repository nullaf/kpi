export interface KpiDataPoint {
  month: string
  revenue: number
  timestamp: number
}

export interface Threshold {
  id: string
  name: string
  value: number
  color: string
  isLocked: boolean
  isVisible: boolean
}

export interface Annotation {
  id: string
  dataPointIndex: number
  month: string
  note: string
  timestamp: number
}

export interface ChartState {
  thresholds: Threshold[]
  annotations: Record<string, Annotation>
  addThreshold: (threshold: Omit<Threshold, "id">) => void
  updateThreshold: (id: string, updates: Partial<Threshold>) => void
  deleteThreshold: (id: string) => void
  addAnnotation: (annotation: Omit<Annotation, "id">) => void
  updateAnnotation: (id: string, updates: Partial<Annotation>) => void
  deleteAnnotation: (id: string) => void
}
