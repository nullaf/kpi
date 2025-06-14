"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { FileText, Save, Trash, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Annotation } from "./types";
import { useChartStore } from "./useChartStore";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface Position {
  x: number;
  y: number;
}

interface AnnotationPopoverProps {
  annotation: Annotation;
  x?: number;
  y?: number;
  getPosition?: () => Position;
}

export const AnnotationPopover: React.FC<AnnotationPopoverProps> = ({
  annotation,
  x,
  y,
  getPosition,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState(annotation.note);
  const [position, setPosition] = useState<Position>({ x: x || 0, y: y || 0 });
  const { updateAnnotation, deleteAnnotation } = useChartStore();

  const updatePosition = useCallback(() => {
    try {
      if (getPosition) {
        const newPosition = getPosition();
        setPosition(newPosition);
      } else if (x !== undefined && y !== undefined) {
        setPosition({ x, y });
      }
    } catch (error) {
      console.warn("Failed to update annotation position:", error);
      setPosition({ x: x || 0, y: y || 0 });
    }
  }, [getPosition, x, y]);

  useEffect(() => {
    updatePosition();

    const handleResize = () => {
      if (getPosition) {
        requestAnimationFrame(updatePosition);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updatePosition, getPosition]);

  const handleSave = useCallback(() => {
    updateAnnotation(annotation.id, { note });
    setIsOpen(false);
  }, [updateAnnotation, annotation.id, note]);

  const handleDelete = useCallback(() => {
    deleteAnnotation(annotation.id);
    setIsOpen(false);
  }, [deleteAnnotation, annotation.id]);

  const handleCancel = useCallback(() => {
    setNote(annotation.note);
    setIsOpen(false);
  }, [annotation.note]);

  useEffect(() => {
    setNote(annotation.note);
  }, [annotation.note]);

  return (
    <TooltipProvider>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <button
                className="absolute -z-1 bg-blue-500 rounded-full border-2 border-white shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center text-white w-6 h-6"
                style={{
                  left: position.x - 12,
                  top: position.y - 12,
                }}
              >
                <FileText className="h-3 w-3" />
              </button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={5} className="z-[5]">
            {annotation.note || "Click to edit annotation"}
          </TooltipContent>
        </Tooltip>
        <PopoverContent
          className="p-4 w-80"
          side="right"
          align="start"
          sideOffset={4}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <Label className="text-sm font-medium">Annotation</Label>
                <span className="text-xs text-muted-foreground">
                  {annotation.month}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="p-0 h-6 w-6"
                title="Close annotation"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add your notes here..."
              className="resize-none min-h-[80px] text-sm"
            />
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm" className="flex-1">
                Save
              </Button>
              <Button onClick={handleDelete} variant="destructive" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
};
