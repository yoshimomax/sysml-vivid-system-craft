
import { useCallback } from "react";
import { diagramEngine } from "../core/DiagramEngine";
import { useModelingStore } from "../store";

export const useAlignmentActions = () => {
  // ストアから選択された要素IDsを取得
  const selectedElementIds = useModelingStore(state => state.selectedElementIds);
  
  // アラインメント機能
  const handleAlignElements = useCallback((direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    console.log(`Aligning elements in direction: ${direction}`);
    if (selectedElementIds.length <= 1) {
      console.log("Need at least 2 elements to align");
      return;
    }
    
    // Log selected elements for debugging
    const elements = useModelingStore.getState().getSelectedElements();
    console.log("Elements to align:", elements);
    
    diagramEngine.alignElements(selectedElementIds, direction);
  }, [selectedElementIds]);
  
  // 複数要素削除機能
  const handleDeleteMultipleElements = useCallback(() => {
    console.log(`Deleting ${selectedElementIds.length} elements`);
    if (selectedElementIds.length === 0) return;
    diagramEngine.deleteMultipleElements(selectedElementIds);
  }, [selectedElementIds]);
  
  return {
    selectedElementIds,
    handleAlignElements,
    handleDeleteMultipleElements
  };
};
