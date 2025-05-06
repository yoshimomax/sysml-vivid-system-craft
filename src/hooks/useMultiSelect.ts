
import { useState, useCallback, RefObject, useEffect } from "react";
import { diagramEngine } from "../core/DiagramEngine";
import { useModelingStore } from "../store";

export const useMultiSelect = (canvasRef: RefObject<HTMLDivElement>) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  
  // Get current scale from store
  const scale = useModelingStore(state => state.scale);
  
  // Get elements from store without subscribing to all changes
  const getElements = useCallback(() => {
    const activeDiagram = useModelingStore.getState().getActiveDiagram();
    return activeDiagram?.elements || [];
  }, []);
  
  // Update local state when store selection changes
  useEffect(() => {
    const selectedIds = useModelingStore.getState().selectedElementIds;
    if (selectedIds.length > 0) {
      setSelectedElementIds(selectedIds);
    }
  }, []);
  
  // Start selection process
  const startSelection = useCallback((e: React.MouseEvent) => {
    console.log("Starting selection");
    // Only start selection if using the primary mouse button
    if (e.button !== 0) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const startX = (e.clientX - rect.left + (canvasRef.current?.scrollLeft || 0)) / scale;
    const startY = (e.clientY - rect.top + (canvasRef.current?.scrollTop || 0)) / scale;
    
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
      diagramEngine.selectMultipleElements([]);
    }
  }, [canvasRef, scale]);
  
  // Update selection box as mouse moves
  const updateSelection = useCallback((e: React.MouseEvent) => {
    if (!isSelecting || !selectionBox || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const endX = (e.clientX - rect.left + (canvasRef.current?.scrollLeft || 0)) / scale;
    const endY = (e.clientY - rect.top + (canvasRef.current?.scrollTop || 0)) / scale;
    
    setSelectionBox({
      ...selectionBox,
      endX,
      endY
    });
  }, [isSelecting, selectionBox, canvasRef, scale]);
  
  // End selection process and determine selected elements
  const endSelection = useCallback(() => {
    console.log("Ending selection", isSelecting, selectionBox);
    if (!isSelecting || !selectionBox) {
      setIsSelecting(false);
      setSelectionBox(null);
      return;
    }
    
    // Convert selection box to normalized coordinates (top-left to bottom-right)
    const left = Math.min(selectionBox.startX, selectionBox.endX);
    const top = Math.min(selectionBox.startY, selectionBox.endY);
    const right = Math.max(selectionBox.startX, selectionBox.endX);
    const bottom = Math.max(selectionBox.startY, selectionBox.endY);
    
    // Selection too small - could be a click
    if (Math.abs(right - left) < 5 || Math.abs(bottom - top) < 5) {
      setIsSelecting(false);
      setSelectionBox(null);
      return;
    }
    
    const elements = getElements();
    console.log("Found elements:", elements);
    
    // Find elements inside the selection box
    const selected = elements.filter(element => {
      const elementRight = element.position.x + element.size.width;
      const elementBottom = element.position.y + element.size.height;
      
      // Check if element intersects with the selection box
      return (
        element.position.x < right &&
        elementRight > left &&
        element.position.y < bottom &&
        elementBottom > top
      );
    });
    
    console.log("Selected elements:", selected);
    const selectedIds = selected.map(el => el.id);
    
    if (selectedIds.length > 0) {
      setSelectedElementIds(selectedIds);
      
      // Use direct call to avoid infinite updates
      const selectMultipleElements = useModelingStore.getState().selectMultipleElements;
      selectMultipleElements(selectedIds);
    }
    
    setIsSelecting(false);
    setSelectionBox(null);
  }, [isSelecting, selectionBox, getElements, scale]);
  
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
