
import { useState, useCallback, useEffect } from "react";
import { diagramEngine } from "../../core/diagram";
import { useModelingStore } from "../../store";
import { Element } from "../../model/types";

/**
 * Hook for managing element selection state and actions
 */
export const useElementSelection = () => {
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  
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
  
  // Find elements within a selection area
  const findElementsInSelection = useCallback((selectionArea: { 
    left: number, 
    top: number, 
    right: number, 
    bottom: number 
  }, shiftKey: boolean) => {
    const { left, top, right, bottom } = selectionArea;
    
    // Selection too small - could be a click - use smaller threshold
    if (Math.abs(right - left) < 2 && Math.abs(bottom - top) < 2) {
      console.log("Selection too small, treating as click");
      return null;
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
      // If shift is held, append to current selection, otherwise replace
      if (shiftKey) {
        const currentIds = [...selectedElementIds];
        const newIds = selectedIds.filter(id => !currentIds.includes(id));
        setSelectedElementIds([...currentIds, ...newIds]);
        diagramEngine.selectMultipleElements([...currentIds, ...newIds]);
      } else {
        setSelectedElementIds(selectedIds);
        diagramEngine.selectMultipleElements(selectedIds);
      }
      
      return selectedIds;
    }
    
    // If no elements were found and we're not using shift key, clear selection
    if (!shiftKey && !selectedIds.length) {
      diagramEngine.selectElement(null);
      diagramEngine.selectMultipleElements([]);
      setSelectedElementIds([]);
    }
    
    return selectedIds;
  }, [getElements, selectedElementIds]);
  
  return {
    selectedElementIds,
    setSelectedElementIds,
    findElementsInSelection
  };
};
