
import { useCallback } from "react";
import { diagramEngine } from "../../core/diagram";

/**
 * Hook for combined mouse event handling
 */
export const useMouseHandlers = (
  isSelecting: boolean,
  updateSelection: (e: React.MouseEvent) => void,
  isCreatingRelationship: boolean,
  handleRelationshipMouseMove: (e: React.MouseEvent, canvasRef: React.RefObject<HTMLDivElement>) => void,
  isDragging: boolean,
  handleDrag: (e: React.MouseEvent, canvasRef: React.RefObject<HTMLDivElement>) => void,
  isResizing: boolean,
  handleResize: (e: MouseEvent, elementId: string, canvasRef: React.RefObject<HTMLDivElement>) => void,
  endSelection: (e?: React.MouseEvent) => void,
  handleDragEnd: () => void,
  endResize: () => void,
  cancelSelection: () => void,
  startSelection: (e: React.MouseEvent) => void
) => {
  // Combined mouse move handler
  const handleMouseMove = useCallback((e: React.MouseEvent, canvasRef: React.RefObject<HTMLDivElement>) => {
    if (isSelecting) {
      // Log coordinates for debugging selection issues
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const scale = diagramEngine.getState().scale;
        const clientX = e.clientX - rect.left;
        const clientY = e.clientY - rect.top;
        const canvasX = clientX / scale + (canvasRef.current?.scrollLeft || 0) / scale;
        const canvasY = clientY / scale + (canvasRef.current?.scrollTop || 0) / scale;
        
        console.log("Mouse move coordinates:", {
          clientX: e.clientX,
          clientY: e.clientY,
          canvasClientX: clientX,
          canvasClientY: clientY,
          canvasX,
          canvasY,
          scale,
          scroll: {
            left: canvasRef.current?.scrollLeft || 0,
            top: canvasRef.current?.scrollTop || 0
          }
        });
      }
      
      updateSelection(e);
      return;
    }
    
    if (isCreatingRelationship) {
      handleRelationshipMouseMove(e, canvasRef);
      return;
    }
    
    if (isDragging) {
      handleDrag(e, canvasRef);
      return;
    }
    
    if (isResizing) {
      // Convert React.MouseEvent to MouseEvent for the resize handler
      handleResize(e.nativeEvent, diagramEngine.getState().selectedElementId || '', canvasRef);
      return;
    }
  }, [isSelecting, updateSelection, isCreatingRelationship, handleRelationshipMouseMove, isDragging, handleDrag, isResizing, handleResize]);
  
  // Mouse up handler
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (isSelecting) {
      // Pass the event so we can check for modifier keys
      endSelection(e);
      return;
    }
    
    if (isDragging) {
      handleDragEnd();
      return;
    }
    
    if (isResizing) {
      endResize();
      return;
    }
  }, [isSelecting, endSelection, isDragging, handleDragEnd, isResizing, endResize]);
  
  // Mouse down handler for canvas
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    // Only start selection with left mouse button
    if (e.button !== 0) return;
    
    // Check if click originated from a canvas area, not an element
    const targetElement = e.target as HTMLElement;
    const isElementClick = targetElement.closest('[data-element-id]');
    
    if (!isElementClick) {
      e.preventDefault(); // Prevent default to ensure we capture the event
      
      // Log coordinates for debugging selection issues
      console.log("Canvas mouse down:", {
        clientX: e.clientX,
        clientY: e.clientY,
        target: e.target
      });
      
      startSelection(e);
    }
  }, [startSelection]);
  
  // Mouse leave handler
  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      handleDragEnd();
    }
    
    if (isSelecting) {
      cancelSelection();
    }
    
    if (isResizing) {
      endResize();
    }
  }, [handleDragEnd, cancelSelection, isDragging, isSelecting, isResizing, endResize]);
  
  // Handle wheel events
  const handleWheel = useCallback((e: React.WheelEvent) => {
    // Check if the wheel event occurred inside an element or context menu
    const targetElement = e.target as HTMLElement;
    const isInsideElement = targetElement.closest('[data-element-id]');
    const isInsideContextMenu = targetElement.closest('.relationship-context-menu');
    
    // If we're inside an element or context menu, don't zoom
    if (isInsideElement || isInsideContextMenu) {
      return;
    }
    
    // Otherwise handle zoom
    e.preventDefault();
    if (e.deltaY < 0) {
      diagramEngine.zoomIn();
    } else {
      diagramEngine.zoomOut();
    }
  }, []);
  
  return {
    handleMouseMove,
    handleMouseUp,
    handleCanvasMouseDown,
    handleMouseLeave,
    handleWheel
  };
};
