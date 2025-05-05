
import { useState, useCallback, RefObject } from "react";
import { Position } from "../model/types";
import { diagramEngine } from "../core/DiagramEngine";
import { useModelingStore } from "../store/modelingStore";

export const useMultiSelect = (canvasRef: RefObject<HTMLDivElement>) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  
  const activeDiagram = useModelingStore(state => state.getActiveDiagram());
  const elements = activeDiagram?.elements || [];
  
  // Start selection process
  const startSelection = useCallback((e: React.MouseEvent) => {
    // Only start selection if using the primary mouse button and not pressing Shift
    if (e.button !== 0 || e.target !== canvasRef.current) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const startX = e.clientX - rect.left + (canvasRef.current?.scrollLeft || 0);
    const startY = e.clientY - rect.top + (canvasRef.current?.scrollTop || 0);
    
    setIsSelecting(true);
    setSelectionBox({
      startX,
      startY,
      endX: startX,
      endY: startY
    });
    
    // Clear selection if not holding shift
    if (!e.shiftKey) {
      setSelectedElementIds([]);
      diagramEngine.selectElement(null);
    }
  }, [canvasRef]);
  
  // Update selection box as mouse moves
  const updateSelection = useCallback((e: React.MouseEvent) => {
    if (!isSelecting || !selectionBox || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const endX = e.clientX - rect.left + (canvasRef.current?.scrollLeft || 0);
    const endY = e.clientY - rect.top + (canvasRef.current?.scrollTop || 0);
    
    setSelectionBox({
      ...selectionBox,
      endX,
      endY
    });
  }, [isSelecting, selectionBox, canvasRef]);
  
  // End selection process and determine selected elements
  const endSelection = useCallback(() => {
    if (!isSelecting || !selectionBox) return;
    
    // Convert selection box to normalized coordinates (top-left to bottom-right)
    const left = Math.min(selectionBox.startX, selectionBox.endX);
    const top = Math.min(selectionBox.startY, selectionBox.endY);
    const right = Math.max(selectionBox.startX, selectionBox.endX);
    const bottom = Math.max(selectionBox.startY, selectionBox.endY);
    
    // Selection too small - could be a click
    if (Math.abs(right - left) < 10 && Math.abs(bottom - top) < 10) {
      setIsSelecting(false);
      setSelectionBox(null);
      return;
    }
    
    // Find elements inside the selection box
    const selected = elements.filter(element => {
      const elementRight = element.position.x + element.size.width;
      const elementBottom = element.position.y + element.size.height;
      
      return (
        element.position.x < right &&
        elementRight > left &&
        element.position.y < bottom &&
        elementBottom > top
      );
    });
    
    const selectedIds = selected.map(el => el.id);
    setSelectedElementIds(selectedIds);
    
    // If exactly one element was selected, update the store's selected element
    if (selectedIds.length === 1) {
      diagramEngine.selectElement(selectedIds[0]);
    }
    
    setIsSelecting(false);
    setSelectionBox(null);
  }, [isSelecting, selectionBox, elements]);
  
  // Abort selection
  const cancelSelection = useCallback(() => {
    setIsSelecting(false);
    setSelectionBox(null);
  }, []);
  
  return {
    isSelecting,
    selectionBox,
    selectedElementIds,
    startSelection,
    updateSelection,
    endSelection,
    cancelSelection,
    setSelectedElementIds
  };
};
