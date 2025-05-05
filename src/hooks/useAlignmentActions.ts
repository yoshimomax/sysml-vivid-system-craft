
import { useCallback } from "react";
import { diagramEngine } from "../core/DiagramEngine";
import { useModelingStore } from "../store";

export const useAlignmentActions = () => {
  const selectedElementIds = useModelingStore(state => state.selectedElementIds);
  
  const handleAlignElements = useCallback((direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    diagramEngine.alignElements(selectedElementIds, direction);
  }, [selectedElementIds]);
  
  const handleDeleteMultipleElements = useCallback(() => {
    diagramEngine.deleteMultipleElements(selectedElementIds);
  }, [selectedElementIds]);
  
  return {
    selectedElementIds,
    handleAlignElements,
    handleDeleteMultipleElements
  };
};
