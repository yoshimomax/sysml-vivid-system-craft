
import { useCallback, RefObject } from "react";
import { useSelectionBox } from "./selection/useSelectionBox";
import { useElementSelection } from "./selection/useElementSelection";
import { diagramEngine } from "../core/diagram";

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
    const ctrlKey = e?.ctrlKey || false;  // Support Ctrl key too for selection
    
    // Find elements in selection and apply selection immediately
    const selectedIds = findElementsInSelection(normalizedBox, shiftKey || ctrlKey);
    console.log("Selected element IDs:", selectedIds);
    
    // Apply selection to store if we found elements
    if (selectedIds && selectedIds.length > 0) {
      console.log("Applying multi-selection with IDs:", selectedIds);
      // Apply multi-selection to the diagram engine
      diagramEngine.selectMultipleElements(selectedIds);
    } else if (!shiftKey && !ctrlKey && selectedElementIds.length > 0) {
      // Clear selection only if:
      // 1. no elements were selected in the box
      // 2. shift/ctrl key isn't pressed
      // 3. we currently have elements selected
      console.log("No elements in selection box, clearing selection");
      diagramEngine.selectElement(null);
      diagramEngine.selectMultipleElements([]);
    }
    
    // Always reset the selection box at the end
    resetSelection();
  }, [isSelecting, selectionBox, getNormalizedSelectionBox, findElementsInSelection, resetSelection, selectedElementIds]);
  
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
