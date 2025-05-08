
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
    
    // Calculate start position in canvas coordinates (adjusted for scale and scroll)
    // IMPORTANT: Using clientX/Y instead of pageX/Y to avoid scroll offset issues
    const startX = (e.clientX - rect.left) / scale + (canvasRef.current?.scrollLeft || 0) / scale;
    const startY = (e.clientY - rect.top) / scale + (canvasRef.current?.scrollTop || 0) / scale;
    
    console.log("Selection starting at canvas coordinates:", { startX, startY, scale });
    
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
    
    // Calculate end position in canvas coordinates (adjusted for scale and scroll)
    // IMPORTANT: Using clientX/Y instead of pageX/Y to avoid scroll offset issues
    const endX = (e.clientX - rect.left) / scale + (canvasRef.current?.scrollLeft || 0) / scale;
    const endY = (e.clientY - rect.top) / scale + (canvasRef.current?.scrollTop || 0) / scale;
    
    console.log("Selection updating to canvas coordinates:", { endX, endY, scale });
    
    setSelectionBox({
      ...selectionBox,
      endX,
      endY
    });
  }, [isSelecting, selectionBox, canvasRef, scale]);
  
  // Reset selection box
  const resetSelection = useCallback(() => {
    setIsSelecting(false);
    setSelectionBox(null);
  }, []);
  
  // Convert selection box to normalized coordinates (top-left to bottom-right)
  const getNormalizedSelectionBox = useCallback(() => {
    if (!selectionBox) return null;
    
    // Convert coordinates to the element coordinate system and normalize
    const left = Math.min(selectionBox.startX, selectionBox.endX);
    const top = Math.min(selectionBox.startY, selectionBox.endY);
    const right = Math.max(selectionBox.startX, selectionBox.endX);
    const bottom = Math.max(selectionBox.startY, selectionBox.endY);
    
    // Ensure the selection box has minimum dimensions to avoid pixel-perfect selection issues
    // A smaller minimum size to catch smaller elements
    const minSize = 1;  // Minimum size of 1 pixel
    const width = right - left;
    const height = bottom - top;
    
    const normalizedBox = {
      left,
      top,
      right: width < minSize ? left + minSize : right,
      bottom: height < minSize ? top + minSize : bottom
    };
    
    console.log("Normalized selection box:", normalizedBox, "Scale:", scale);
    
    return normalizedBox;
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
