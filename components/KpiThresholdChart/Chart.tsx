"use client"

import type React from "react"
import { useCallback, useMemo, useRef, useEffect, useState, useLayoutEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { useChartStore } from "./useChartStore"
import { ThresholdPill } from "./ThresholdPill"
import { AddThresholdDialog } from "./AddThresholdDialog"
import { AnnotationPopover } from "./AnnotationPopover"
import { useKpiData, useRefreshKpiData } from "@/hooks/useKpiData"
import { formatCurrency, calculateYAxisDomain, snapToInteger } from "./utils"
import type { Threshold } from "./types"

export const KpiThresholdChart: React.FC = () => {
  const { thresholds, annotations, updateThreshold, addAnnotation, addThreshold } = useChartStore()
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const { data: kpiData, isLoading, error, refetch } = useKpiData()
  const refreshKpiData = useRefreshKpiData()
  const [showThresholds, setShowThresholds] = useState(false)
  const [thresholdPositions, setThresholdPositions] = useState(new Map<string, { x: number; y: number }>())

  // Auto-generate intelligent thresholds on first load
  useEffect(() => {
    if (kpiData && kpiData.length > 0 && thresholds.length === 0) {
      const revenues = kpiData.map((d) => d.revenue)
      const minRevenue = Math.min(...revenues)
      const avgRevenue = revenues.reduce((sum, r) => sum + r, 0) / revenues.length
      const variance = revenues.reduce((sum, r) => sum + Math.pow(r - avgRevenue, 2), 0) / revenues.length
      const stdDev = Math.sqrt(variance)

      const thresholdsToAdd = [
        {
          name: "Performance Target",
          value: snapToInteger(avgRevenue + stdDev * 0.5),
          color: "#10b981",
          isLocked: false,
          isVisible: true,
        },
        {
          name: "Warning Level",
          value: snapToInteger(avgRevenue - stdDev * 0.5),
          color: "#f59e0b",
          isLocked: false,
          isVisible: true,
        },
        {
          name: "Critical Threshold",
          value: snapToInteger(Math.max(minRevenue * 0.9, avgRevenue - stdDev)),
          color: "#ef4444",
          isLocked: false,
          isVisible: true,
        },
      ]

      thresholdsToAdd.forEach((threshold, index) => {
        setTimeout(() => {
          addThreshold(threshold)
        }, index * 100)
      })

      setTimeout(() => setShowThresholds(true), 500)
    } else if (thresholds.length > 0) {
      setShowThresholds(true)
    }
  }, [kpiData, thresholds.length, addThreshold])

  const yAxisDomain = useMemo(() => {
    if (!kpiData || kpiData.length === 0) return [0, 1000000]
    return calculateYAxisDomain(kpiData, thresholds)
  }, [kpiData, thresholds])

  const visibleThresholds = useMemo(() => thresholds.filter((t) => t.isVisible), [thresholds])

  const calculateThresholdPosition = useCallback(
    (threshold: Threshold, chartContainer: HTMLElement) => {
      if (!chartContainer) return { x: 0, y: 0 }

      const rect = chartContainer.getBoundingClientRect()
      const chartArea = {
        top: 16 + 20,
        bottom: 16 + 20,
        left: 16 + 80,
        right: 16 + 30,
      }

      const chartHeight = rect.height - chartArea.top - chartArea.bottom
      const [minY, maxY] = yAxisDomain
      const valuePosition = (threshold.value - minY) / (maxY - minY)
      const yPosition = chartArea.top + chartHeight * (1 - valuePosition)
      const xPosition = chartArea.left - 10

      return { x: xPosition, y: yPosition }
    },
    [yAxisDomain],
  )

  const calculateAnnotationPosition = useCallback(
    (annotation: { dataPointIndex: number }, chartContainer: HTMLElement) => {
      if (!kpiData || !chartContainer) return { x: 0, y: 0 }

      const rect = chartContainer.getBoundingClientRect()
      const chartArea = {
        top: 16 + 20,
        bottom: 16 + 20,
        left: 16 + 80,
        right: 16 + 30,
      }

      const chartWidth = rect.width - chartArea.left - chartArea.right
      const chartHeight = rect.height - chartArea.top - chartArea.bottom

      const dataPoint = kpiData[annotation.dataPointIndex]
      if (!dataPoint) return { x: 0, y: 0 }

      const xPosition = chartArea.left + (annotation.dataPointIndex / (kpiData.length - 1)) * chartWidth
      const [minY, maxY] = yAxisDomain
      const valuePosition = (dataPoint.revenue - minY) / (maxY - minY)
      const yPosition = chartArea.top + chartHeight * (1 - valuePosition)

      return { x: xPosition, y: yPosition }
    },
    [kpiData, yAxisDomain],
  )

  const updatePositions = useCallback(() => {
    if (!chartContainerRef.current || visibleThresholds.length === 0 || !kpiData) {
      setThresholdPositions(new Map())
      return
    }

    const positions = new Map<string, { x: number; y: number }>()
    visibleThresholds.forEach((threshold) => {
      positions.set(threshold.id, calculateThresholdPosition(threshold, chartContainerRef.current!))
    })
    setThresholdPositions(positions)
  }, [visibleThresholds, calculateThresholdPosition, kpiData])

  useLayoutEffect(() => {
    updatePositions()
  }, [updatePositions])

  useEffect(() => {
    if (showThresholds) {
      const timer = setTimeout(updatePositions, 150)
      return () => clearTimeout(timer)
    }
  }, [showThresholds, updatePositions])

  useEffect(() => {
    const handleResize = () => {
      if (chartContainerRef.current && visibleThresholds.length > 0) {
        updatePositions()
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [updatePositions, visibleThresholds.length])

  const handleChartDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      if (!kpiData || !chartContainerRef.current) return

      const rect = chartContainerRef.current.getBoundingClientRect()
      const x = event.clientX - rect.left
      const chartArea = {
        left: 16 + 80,
        right: 16 + 30,
      }

      const chartWidth = rect.width - chartArea.left - chartArea.right
      const dataPointIndex = Math.round(((x - chartArea.left) / chartWidth) * (kpiData.length - 1))
      const clampedIndex = Math.max(0, Math.min(dataPointIndex, kpiData.length - 1))

      const dataPoint = kpiData[clampedIndex]
      if (!dataPoint) return

      addAnnotation({
        dataPointIndex: clampedIndex,
        month: dataPoint.month,
        note: "",
        timestamp: Date.now(),
      })
    },
    [addAnnotation, kpiData],
  )

  const handleThresholdMouseDown = useCallback(
    (thresholdId: string, event: React.MouseEvent) => {
      const threshold = thresholds.find((t) => t.id === thresholdId)
      if (!threshold || threshold.isLocked) return

      event.preventDefault()

      const handleMouseMove = (e: MouseEvent) => {
        if (!chartContainerRef.current) return

        const rect = chartContainerRef.current.getBoundingClientRect()
        const chartArea = {
          top: 16 + 20,
          bottom: 16 + 20,
        }

        const chartHeight = rect.height - chartArea.top - chartArea.bottom
        const relativeY = e.clientY - rect.top - chartArea.top

        const [minY, maxY] = yAxisDomain
        const normalizedY = 1 - relativeY / chartHeight
        const newValue = minY + normalizedY * (maxY - minY)

        const snappedValue = snapToInteger(Math.max(minY, Math.min(maxY, newValue)))
        updateThreshold(thresholdId, { value: snappedValue })
      }

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    },
    [thresholds, updateThreshold, yAxisDomain],
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-slate-600 text-sm">Loading KPI data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg border border-red-200">
        <div className="flex flex-col items-center space-y-4 text-center p-6">
          <div className="text-red-500">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.312 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-900">Failed to load KPI data</h3>
            <p className="text-red-700 text-sm mt-1">
              {error instanceof Error ? error.message : "An unexpected error occurred"}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!kpiData || kpiData.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex flex-col items-center space-y-3 text-center p-6">
          <div className="text-slate-400">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">No data available</h3>
            <p className="text-slate-600 text-sm mt-1">There's no KPI data to display at the moment.</p>
          </div>
          <button
            onClick={() => refreshKpiData.mutate()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            disabled={refreshKpiData.isPending}
          >
            {refreshKpiData.isPending ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Revenue Performance</h2>
          <p className="text-slate-600">Monthly revenue with interactive thresholds</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refreshKpiData.mutate()}
            disabled={refreshKpiData.isPending}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Refresh KPI data"
          >
            <svg
              className={`w-4 h-4 ${refreshKpiData.isPending ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {refreshKpiData.isPending ? "Refreshing..." : "Refresh"}
          </button>
          <AddThresholdDialog />
        </div>
      </div>

      {thresholds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {thresholds.map((threshold) => (
            <ThresholdPill key={threshold.id} threshold={threshold} />
          ))}
        </div>
      )}

      <div
        ref={chartContainerRef}
        className="relative bg-slate-50 rounded-lg p-4 border border-slate-200"
        onDoubleClick={handleChartDoubleClick}
      >
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={kpiData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
            const position = thresholdPositions.get(threshold.id) || { x: 0, y: 0 }
            return (
              <div
                key={`handle-${threshold.id}`}
                className={`absolute z-20 flex items-center ${
                  threshold.isLocked ? "cursor-default" : "cursor-ns-resize"
                }`}
                style={{
                  left: position.x - 8,
                  top: position.y - 12,
                }}
                onMouseDown={(e) => handleThresholdMouseDown(threshold.id, e)}
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
                  <div className="text-xs opacity-90">{formatCurrency(threshold.value)}</div>
                </div>
              </div>
            )
          })}

        {Object.values(annotations).map((annotation) => (
          <AnnotationPopover
            key={annotation.id}
            annotation={annotation}
            getPosition={() => calculateAnnotationPosition(annotation, chartContainerRef.current!)}
          />
        ))}
      </div>

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
          <div className="text-sm text-purple-600 font-medium">Active Thresholds</div>
          <div className="text-xl font-bold text-purple-900">{visibleThresholds.length}</div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="text-sm text-orange-600 font-medium">Annotations</div>
          <div className="text-xl font-bold text-orange-900">{Object.keys(annotations).length}</div>
        </div>
      </div>
    </div>
  )
}
