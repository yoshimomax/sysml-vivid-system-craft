
import { useCallback } from "react";
import { useContextMenu } from "../useContextMenu";
import { diagramEngine } from "../../core/diagram";

/**
 * Hook for handling canvas click events and coordinating with other interaction states
 */
export const useCanvasEvents = (
  isSelecting: boolean,
  isDragging: boolean,
  isResizing: boolean,
  isCreatingRelationship: boolean,
  cancelRelationshipCreation: () => void,
  contextMenuPosition: any,
  setContextMenuPosition: (position: any) => void,
  setElementForContextMenu: (elementId: string | null) => void,
) => {
  // Handle canvas click
  const handleCanvasClick = useCallback((e: React.MouseEvent, canvasRef: React.RefObject<HTMLDivElement>) => {
    // Close context menu when clicking anywhere except on the menu itself
    if (contextMenuPosition && !(e.target as Element).closest('.relationship-context-menu')) {
      setContextMenuPosition(null);
      setElementForContextMenu(null);
    }
    
    // Check if click originated from a canvas area, not an element
    const isElementClick = (e.target as Element).closest('[data-element-id]');
    const isCanvasClick = e.target === canvasRef.current || 
                          (e.target as Element)?.closest('.grid-layer') ||
                          (e.target as Element)?.closest('.canvas-wrapper');
    
    // Deselect all elements when clicking on empty canvas
    if (!isElementClick && isCanvasClick && !isSelecting && !isDragging && !isResizing) {
      diagramEngine.selectElement(null);
      diagramEngine.selectMultipleElements([]);
    }
    
    // If relationship creation is in progress, cancel it
    if (isCreatingRelationship && isCanvasClick) {
      cancelRelationshipCreation();
    }
  }, [contextMenuPosition, setContextMenuPosition, setElementForContextMenu, isSelecting, isDragging, isResizing, isCreatingRelationship, cancelRelationshipCreation]);
  
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
