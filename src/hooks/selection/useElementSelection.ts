
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
      return [];
    }
    
    const elements = getElements();
    console.log("Finding elements in selection area:", { left, top, right, bottom });
    console.log("Total elements to check:", elements.length);
    
    // Find elements inside the selection box
    const selected = elements.filter(element => {
      // Calculate element's bounds
      const elementRight = element.position.x + element.size.width;
      const elementBottom = element.position.y + element.size.height;
      
      // An element is selected if it's at least partially inside the selection box
      // This uses a proper intersection test between the selection rectangle and the element rectangle
      const intersects = (
        element.position.x < right &&
        elementRight > left &&
        element.position.y < bottom &&
        elementBottom > top
      );
      
      console.log(`Element ${element.id} at (${element.position.x},${element.position.y}) size ${element.size.width}x${element.size.height} intersects: ${intersects}`);
      
      return intersects;
    });
    
    console.log("Selected elements:", selected.length, selected.map(el => el.id));
    const selectedIds = selected.map(el => el.id);
    
    // Always apply the selection if we found elements, regardless of whether it's empty
    let newSelection: string[];
    if (shiftKey && selectedIds.length > 0) {
      // Add new elements without duplicates when shift is pressed
      const currentIds = [...selectedElementIds];
      const newIds = selectedIds.filter(id => !currentIds.includes(id));
      newSelection = [...currentIds, ...newIds];
    } else {
      // Replace selection when shift is not pressed
      newSelection = selectedIds;
    }
    
    console.log("Setting selection to:", newSelection);
    setSelectedElementIds(newSelection);
    
    // Apply the multi-selection to the diagram engine
    diagramEngine.selectMultipleElements(newSelection);
    return selectedIds;
  }, [getElements, selectedElementIds]);
  
  return {
    selectedElementIds,
    setSelectedElementIds,
    findElementsInSelection
  };
};
