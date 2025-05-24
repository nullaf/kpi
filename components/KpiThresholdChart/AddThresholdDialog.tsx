"use client"

import type React from "react"
import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useChartStore } from "./useChartStore"

const PREDEFINED_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
]

export const AddThresholdDialog: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [value, setValue] = useState("")
  const [selectedColor, setSelectedColor] = useState(PREDEFINED_COLORS[0])
  const { addThreshold } = useChartStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !value.trim()) return

    const numericValue = Number.parseInt(value.replace(/[^\d]/g, ""), 10)
    if (isNaN(numericValue)) return

    addThreshold({
      name: name.trim(),
      value: numericValue,
      color: selectedColor,
      isLocked: false,
      isVisible: true,
    })

    // Reset form
    setName("")
    setValue("")
    setSelectedColor(PREDEFINED_COLORS[0])
    setOpen(false)
  }

  const handleCancel = () => {
    setName("")
    setValue("")
    setSelectedColor(PREDEFINED_COLORS[0])
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Threshold
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Threshold</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="threshold-name">Name</Label>
            <Input
              id="threshold-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Revenue Target"
              className="mt-1"
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="threshold-value">Value</Label>
            <Input
              id="threshold-value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g., 750000"
              className="mt-1"
              type="text"
              inputMode="numeric"
            />
          </div>

          <div>
            <Label>Color</Label>
            <div className="grid grid-cols-8 gap-2 mt-2">
              {PREDEFINED_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    selectedColor === color ? "border-slate-900 scale-110" : "border-slate-300"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select ${color} color`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Add Threshold
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
