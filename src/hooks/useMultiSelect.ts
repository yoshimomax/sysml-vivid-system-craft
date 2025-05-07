
import { useCallback, RefObject } from "react";
import { useSelectionBox } from "./selection/useSelectionBox";
import { useElementSelection } from "./selection/useElementSelection";

/**
 * Main hook for multi-selection functionality
 */
export const useMultiSelect = (canvasRef: RefObject<HTMLDivElement>) => {
  const {
    isSelecting,
    selectionBox,
    startSelection,
    updateSelection,
    resetSelection,
    getNormalizedSelectionBox
  } = useSelectionBox(canvasRef);
  
  const {
    selectedElementIds,
    setSelectedElementIds,
    findElementsInSelection
  } = useElementSelection();
  
  // End selection process and determine selected elements
  const endSelection = useCallback((e?: React.MouseEvent) => {
    console.log("Ending selection", isSelecting, selectionBox);
    if (!isSelecting || !selectionBox) {
      resetSelection();
      return;
    }
    
    const normalizedBox = getNormalizedSelectionBox();
    if (!normalizedBox) {
      resetSelection();
      return;
    }
    
    // Check if shift key is pressed for additive selection
    const shiftKey = e?.shiftKey || false;
    const selectedIds = findElementsInSelection(normalizedBox, shiftKey);
    console.log("Selected element IDs:", selectedIds);
    
    resetSelection();
  }, [isSelecting, selectionBox, getNormalizedSelectionBox, findElementsInSelection, resetSelection]);
  
  // Cancel selection without selecting elements
  const cancelSelection = useCallback(() => {
    resetSelection();
  }, [resetSelection]);
  
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
