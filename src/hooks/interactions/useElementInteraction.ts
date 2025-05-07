
import { useCallback } from "react";
import { diagramEngine } from "../../core/diagram";

/**
 * Hook for handling element interactions (mouse down events)
 */
export const useElementInteraction = (
  isCreatingRelationship: boolean,
  relationshipSourceId: string | null,
  completeRelationship: (targetId: string) => void,
  isResizeHandleClick: (target: EventTarget) => boolean,
  startResize: (e: React.MouseEvent, element: any, handle: string, canvasRef: React.RefObject<HTMLDivElement>) => void,
  handleDragStart: (e: React.MouseEvent, elementId: string, canvasRef: React.RefObject<HTMLDivElement>) => void,
) => {
  // Handle element mouse down for drag, resize, or selection
  const handleElementMouseDown = useCallback((e: React.MouseEvent, elementId: string, canvasRef: React.RefObject<HTMLDivElement>) => {
    e.stopPropagation();
    
    // Check if clicking on a resize handle
    if (isResizeHandleClick(e.target)) {
      const handle = (e.target as HTMLElement).getAttribute('data-handle');
      const element = diagramEngine.getElementById(elementId);
      if (element && handle) {
        startResize(e, element, handle as any, canvasRef);
        return;
      }
    }
    
    // If we're creating a relationship
    if (isCreatingRelationship) {
      // If we already have a source, this is the target
      if (relationshipSourceId) {
        completeRelationship(elementId);
      }
      return;
    }
    
    // Handle selection
    const shiftKey = e.shiftKey;
    const currentSelectedIds = diagramEngine.getState().selectedElementIds;
    
    // If shift key is pressed, toggle this element in the selection
    if (shiftKey) {
      let newSelection = [...currentSelectedIds];
      
      if (newSelection.includes(elementId)) {
        // Remove if already selected
        newSelection = newSelection.filter(id => id !== elementId);
      } else {
        // Add if not already selected
        newSelection.push(elementId);
      }
      
      diagramEngine.selectMultipleElements(newSelection);
    } 
    // If the clicked element is not part of the current multi-selection
    else if (currentSelectedIds.length > 1 && !currentSelectedIds.includes(elementId)) {
      // Clear multi-selection and select just this element
      diagramEngine.selectElement(elementId);
    }
    // If not using shift key and element is not already in a multi-selection
    else {
      // Start dragging the element
      handleDragStart(e, elementId, canvasRef);
    }
  }, [isCreatingRelationship, relationshipSourceId, completeRelationship, handleDragStart, isResizeHandleClick, startResize]);

  return {
    handleElementMouseDown
  };
};
