"use client"

import type React from "react"
import { Trash2, Lock, Unlock, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Threshold } from "./types"
import { formatCurrency, getContrastColor } from "./utils"
import { useChartStore } from "./useChartStore"

interface ThresholdPillProps {
  threshold: Threshold
}

export const ThresholdPill: React.FC<ThresholdPillProps> = ({ threshold }) => {
  const { updateThreshold, deleteThreshold } = useChartStore()

  const handleToggleLock = () => {
    updateThreshold(threshold.id, { isLocked: !threshold.isLocked })
  }

  const handleToggleVisibility = () => {
    updateThreshold(threshold.id, { isVisible: !threshold.isVisible })
  }

  const handleDelete = () => {
    deleteThreshold(threshold.id)
  }

  const textColor = getContrastColor(threshold.color)

  return (
    <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
      <Badge
        className="px-3 py-1 text-sm font-medium"
        style={{
          backgroundColor: threshold.color,
          color: textColor,
          opacity: threshold.isVisible ? 1 : 0.5,
        }}
      >
        {threshold.name}
      </Badge>

      <span className="text-sm font-mono text-slate-600">{formatCurrency(threshold.value)}</span>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleVisibility}
          className="h-6 w-6 p-0"
          title={threshold.isVisible ? "Hide threshold" : "Show threshold"}
        >
          {threshold.isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleLock}
          className="h-6 w-6 p-0"
          title={threshold.isLocked ? "Unlock threshold" : "Lock threshold"}
        >
          {threshold.isLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
          title="Delete threshold"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
