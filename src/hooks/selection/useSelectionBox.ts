
import { useState, useCallback, RefObject } from "react";
import { Position } from "../../model/types";
import { useModelingStore } from "../../store";

interface SelectionBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

/**
 * Hook for managing the selection box state and calculations
 */
export const useSelectionBox = (canvasRef: RefObject<HTMLDivElement>) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  
  // Get current scale from store
  const scale = useModelingStore(state => state.scale);
  
  // Start selection process
  const startSelection = useCallback((e: React.MouseEvent) => {
    // Only start selection if using the primary mouse button
    if (e.button !== 0) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    // Calculate start position in canvas coordinates
    const startX = e.clientX - rect.left + (canvasRef.current?.scrollLeft || 0);
    const startY = e.clientY - rect.top + (canvasRef.current?.scrollTop || 0);
    
    console.log("Selection starting at:", { startX, startY, scale });
    
    setIsSelecting(true);
    setSelectionBox({
      startX,
      startY,
      endX: startX,
      endY: startY
    });
  }, [canvasRef, scale]);
  
  // Update selection box as mouse moves
  const updateSelection = useCallback((e: React.MouseEvent) => {
    if (!isSelecting || !selectionBox || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    // Calculate end position in canvas coordinates
    const endX = e.clientX - rect.left + (canvasRef.current?.scrollLeft || 0);
    const endY = e.clientY - rect.top + (canvasRef.current?.scrollTop || 0);
    
    console.log("Selection updating to:", { endX, endY });
    
    setSelectionBox({
      ...selectionBox,
      endX,
      endY
    });
  }, [isSelecting, selectionBox, canvasRef]);
  
  // Reset selection box
  const resetSelection = useCallback(() => {
    setIsSelecting(false);
    setSelectionBox(null);
  }, []);
  
  // Convert selection box to normalized coordinates (top-left to bottom-right)
  const getNormalizedSelectionBox = useCallback(() => {
    if (!selectionBox) return null;
    
    // Convert from screen coordinates to canvas coordinates by dividing by scale
    // These are now in the coordinate system of the diagram elements
    const left = Math.min(selectionBox.startX, selectionBox.endX) / scale;
    const top = Math.min(selectionBox.startY, selectionBox.endY) / scale;
    const right = Math.max(selectionBox.startX, selectionBox.endX) / scale;
    const bottom = Math.max(selectionBox.startY, selectionBox.endY) / scale;
    
    console.log("Normalized selection box:", { left, top, right, bottom, scale });
    
    return { left, top, right, bottom };
  }, [selectionBox, scale]);
  
  return {
    isSelecting,
    selectionBox,
    startSelection,
    updateSelection,
    resetSelection,
    getNormalizedSelectionBox
  };
};
