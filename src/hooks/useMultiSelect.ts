
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
    const unsubscribe = useModelingStore.subscribe((state) => {
      const storeSelectedIds = state.selectedElementIds;
      if (JSON.stringify(storeSelectedIds) !== JSON.stringify(selectedElementIds)) {
        setSelectedElementIds(storeSelectedIds);
      }
    });
    
    return () => unsubscribe();
  }, [selectedElementIds]);
  
  // Start selection process
  const startSelection = useCallback((e: React.MouseEvent) => {
    console.log("Starting selection process", e.button, e.target);
    // Only start selection if using the primary mouse button
    if (e.button !== 0) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    // Calculate start position in canvas coordinates
    // These are raw coordinates (not scaled)
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
    
    // Clear selection if not holding shift
    if (!e.shiftKey) {
      setSelectedElementIds([]);
      // We don't immediately clear the store selection here, we'll do it on selection end
      // if no elements were found
    }
  }, [canvasRef, scale]);
  
  // Update selection box as mouse moves
  const updateSelection = useCallback((e: React.MouseEvent) => {
    if (!isSelecting || !selectionBox || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    // Calculate end position in canvas coordinates
    // These are raw coordinates (not scaled)
    const endX = e.clientX - rect.left + (canvasRef.current?.scrollLeft || 0);
    const endY = e.clientY - rect.top + (canvasRef.current?.scrollTop || 0);
    
    console.log("Selection updating to:", { endX, endY, scale });
    
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
    // Use scale to convert from screen coordinates to canvas coordinates
    const left = Math.min(selectionBox.startX, selectionBox.endX) / scale;
    const top = Math.min(selectionBox.startY, selectionBox.endY) / scale;
    const right = Math.max(selectionBox.startX, selectionBox.endX) / scale;
    const bottom = Math.max(selectionBox.startY, selectionBox.endY) / scale;
    
    console.log("Selection box normalized:", { left, top, right, bottom, scale });
    
    // Selection too small - could be a click - use smaller threshold
    if (Math.abs(right - left) < 2 && Math.abs(bottom - top) < 2) {
      console.log("Selection too small, treating as click");
      setIsSelecting(false);
      setSelectionBox(null);
      return;
    }
    
    const elements = getElements();
    console.log("Found elements for selection:", elements.length);
    
    // Find elements inside the selection box
    const selected = elements.filter(element => {
      const elementRight = element.position.x + element.size.width;
      const elementBottom = element.position.y + element.size.height;
      
      // Check if element intersects with the selection box
      const intersects = (
        element.position.x < right &&
        elementRight > left &&
        element.position.y < bottom &&
        elementBottom > top
      );
      
      console.log(`Element ${element.id} intersects: ${intersects}`, {
        elementPos: element.position,
        elementSize: element.size,
        selectionBox: { left, top, right, bottom }
      });
      
      return intersects;
    });
    
    console.log("Selected elements:", selected.length);
    const selectedIds = selected.map(el => el.id);
    
    if (selectedIds.length > 0) {
      setSelectedElementIds(selectedIds);
      
      // Use the store action to update selection
      const selectMultipleElements = useModelingStore.getState().selectMultipleElements;
      selectMultipleElements(selectedIds);
    } else if (!selectedIds.length) {
      // Only clear selection if we actually performed a selection (not just a click)
      // and no elements were found
      diagramEngine.selectElement(null);
      diagramEngine.selectMultipleElements([]);
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
