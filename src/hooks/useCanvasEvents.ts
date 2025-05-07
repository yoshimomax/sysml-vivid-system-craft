
import { useCallback } from "react";
import { diagramEngine } from "../core/diagram";

/**
 * Hook for handling canvas click events and selections
 */
export const useCanvasEvents = (
  isSelecting: boolean,
  isDragging: boolean,
  isCreatingRelationship: boolean,
  cancelRelationshipCreation: () => void
) => {
  // Handle canvas click
  const handleCanvasClick = useCallback((e: React.MouseEvent, canvasRef: React.RefObject<HTMLDivElement>) => {
    console.log("Canvas click", e.target, canvasRef.current);
    
    // Only process if target is the canvas or a direct canvas child (grid, etc)
    const isCanvas = 
      e.target === canvasRef.current || 
      e.target === canvasRef.current?.firstChild ||
      (e.target as Element)?.closest('.canvas-wrapper');
    
    // If this is the end of a selection or drag, don't reset the selection
    if (isSelecting || isDragging) {
      console.log("Skipping deselection during selection/drag");
      return;
    }
    
    if (isCanvas) {
      // If relationship creation is in progress, cancel it
      if (isCreatingRelationship) {
        cancelRelationshipCreation();
        return;
      }
      
      // Only deselect when specifically clicking on empty canvas
      // and not at the end of a drag or selection operation
      const isGridLayerClick = (e.target as Element)?.closest('.grid-layer');
      if (isGridLayerClick) {
        console.log("Deselecting all elements on grid layer click");
        diagramEngine.selectElement(null);
        diagramEngine.selectRelationship(null);
        diagramEngine.selectMultipleElements([]);
      }
    }
  }, [isCreatingRelationship, cancelRelationshipCreation, isSelecting, isDragging]);
  
  // Handle relationship click
  const handleRelationshipClick = useCallback((e: React.MouseEvent, relationshipId: string) => {
    e.stopPropagation();
    diagramEngine.selectRelationship(relationshipId);
  }, []);
  
  return {
    handleCanvasClick,
    handleRelationshipClick
  };
};
