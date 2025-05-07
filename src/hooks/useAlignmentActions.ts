
import { useCallback } from "react";
import { useModelingStore } from "../store/modelingStore";
import { diagramEngine } from "../core/diagram";

export const useAlignmentActions = () => {
  const selectedElementIds = useModelingStore(state => state.selectedElementIds);
  
  // Handle alignment of multiple elements
  const handleAlignElements = useCallback((direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (selectedElementIds.length <= 1) return;
    
    diagramEngine.alignElements(selectedElementIds, direction);
  }, [selectedElementIds]);
  
  // Delete multiple elements
  const handleDeleteMultipleElements = useCallback(() => {
    if (selectedElementIds.length === 0) return;
    
    diagramEngine.deleteMultipleElements(selectedElementIds);
  }, [selectedElementIds]);
  
  return {
    selectedElementIds,
    handleAlignElements,
    handleDeleteMultipleElements
  };
};
