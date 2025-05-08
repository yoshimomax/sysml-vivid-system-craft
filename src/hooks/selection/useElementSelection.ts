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
    
    // Selection width and height
    const selectionWidth = Math.abs(right - left);
    const selectionHeight = Math.abs(bottom - top);
    
    console.log("Finding elements in selection area:", { left, top, right, bottom });
    console.log("Selection dimensions:", { width: selectionWidth, height: selectionHeight });
    
    // If selection is extremely small, it might be a click rather than a drag
    // But we'll lower the threshold to catch smaller drag selections
    const minSelectionSize = 2;
    
    // Get elements and check for intersection
    const elements = getElements();
    console.log("Total elements to check:", elements.length);
    
    // Find elements inside the selection box
    const selected = elements.filter(element => {
      // Get element bounds
      // If element size is not defined or zero, use a default minimum size
      const width = element.size?.width || 50;
      const height = element.size?.height || 50;
      
      // Calculate element's bounds
      const elementLeft = element.position.x;
      const elementTop = element.position.y;
      const elementRight = elementLeft + width;
      const elementBottom = elementTop + height;
      
      // Debug information
      console.log(`Element ${element.id} bounds:`, {
        left: elementLeft,
        top: elementTop,
        right: elementRight,
        bottom: elementBottom,
        width,
        height
      });
      
      // An element is selected if it's at least partially inside the selection box
      // This uses a proper intersection test between the selection rectangle and the element rectangle
      const intersects = (
        elementLeft < right &&
        elementRight > left &&
        elementTop < bottom &&
        elementBottom > top
      );
      
      console.log(`Element ${element.id} at (${element.position.x},${element.position.y}) size ${width}x${height} intersects: ${intersects}`);
      
      return intersects;
    });
    
    console.log("Selected elements:", selected.length, selected.map(el => el.id));
    const selectedIds = selected.map(el => el.id);
    
    // Always apply the selection if the selection box is large enough
    let newSelection: string[];
    if (selectionWidth < minSelectionSize && selectionHeight < minSelectionSize) {
      // For very small selections (likely clicks), keep the current behavior
      return selectedElementIds;
    }
    
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
    
    // Return the ids to be handled by the caller
    return newSelection;
  }, [getElements, selectedElementIds]);
  
  return {
    selectedElementIds,
    setSelectedElementIds,
    findElementsInSelection
  };
};
