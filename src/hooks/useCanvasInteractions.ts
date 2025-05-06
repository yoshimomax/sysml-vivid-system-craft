import { useState, useCallback, useEffect } from "react";
import { diagramEngine } from "../core/DiagramEngine";
import { useElementDrag } from "./useElementDrag";
import { useElementResize } from "./useElementResize";
import { useMultiSelect } from "./useMultiSelect";
import { useRelationshipCreation } from "./useRelationshipCreation";
import { useContextMenu } from "./useContextMenu";
import { useCanvasEvents } from "./useCanvasEvents";

/**
 * Main hook that combines all canvas interaction hooks
 */
export const useCanvasInteractions = (canvasRef: React.RefObject<HTMLDivElement>) => {
  // Get hooks
  const {
    isDragging,
    handleDragStart,
    handleDrag,
    handleDragEnd
  } = useElementDrag();
  
  const {
    isResizing,
    startResize,
    handleResize,
    endResize,
    isResizeHandleClick
  } = useElementResize();
  
  const {
    isCreatingRelationship,
    tempEndPoint,
    relationshipSourceId,
    relationshipType,
    startRelationship,
    handleMouseMove: handleRelationshipMouseMove,
    cancelRelationshipCreation,
    completeRelationship
  } = useRelationshipCreation();
  
  const {
    isSelecting,
    selectionBox,
    selectedElementIds: localSelectedIds,
    startSelection,
    updateSelection,
    endSelection,
    cancelSelection,
    setSelectedElementIds
  } = useMultiSelect(canvasRef);
  
  const {
    contextMenuPosition,
    elementForContextMenu,
    setContextMenuPosition,
    setElementForContextMenu,
    handleCanvasContextMenu,
    handleElementContextMenu
  } = useContextMenu();
  
  const {
    handleCanvasClick: baseHandleCanvasClick,
    handleRelationshipClick
  } = useCanvasEvents(
    isSelecting,
    isDragging,
    isCreatingRelationship,
    cancelRelationshipCreation
  );
  
  // Update store when local selection changes
  const updateStoreSelection = useCallback(() => {
    if (localSelectedIds.length > 0) {
      diagramEngine.selectMultipleElements(localSelectedIds);
    }
  }, [localSelectedIds]);
  
  // Wrap the base handle canvas click to provide the canvas ref
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Close context menu when clicking anywhere except on the menu itself
    if (contextMenuPosition && !(e.target as Element).closest('.relationship-context-menu')) {
      setContextMenuPosition(null);
      setElementForContextMenu(null);
    }
    
    // Deselect all elements when clicking on empty canvas
    const isElementClick = (e.target as Element).closest('[data-element-id]');
    const isCanvasClick = e.target === canvasRef.current || 
                          (e.target as Element)?.closest('.grid-layer') ||
                          (e.target as Element)?.closest('.canvas-wrapper');
    
    if (!isElementClick && isCanvasClick && !isSelecting && !isDragging && !isResizing) {
      diagramEngine.selectElement(null);
      diagramEngine.selectMultipleElements([]);
    }
    
    baseHandleCanvasClick(e, canvasRef);
  }, [baseHandleCanvasClick, canvasRef, contextMenuPosition, setContextMenuPosition, setElementForContextMenu, isSelecting, isDragging, isResizing]);
  
  // Handle element mouse down for drag, resize, or selection
  const handleElementMouseDown = useCallback((e: React.MouseEvent, elementId: string) => {
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
  }, [isCreatingRelationship, relationshipSourceId, completeRelationship, handleDragStart, canvasRef, isResizeHandleClick, startResize]);
  
  // Handle relationship type selection
  const handleRelationshipTypeSelect = useCallback((type: any) => {
    if (elementForContextMenu) {
      startRelationship(elementForContextMenu, type);
    }
    setContextMenuPosition(null);
    setElementForContextMenu(null);
  }, [elementForContextMenu, startRelationship, setContextMenuPosition, setElementForContextMenu]);
  
  // Combined mouse move handler
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isSelecting) {
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
  }, [isSelecting, updateSelection, isCreatingRelationship, handleRelationshipMouseMove, isDragging, handleDrag, isResizing, handleResize, canvasRef]);
  
  // Mouse up handler
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (isSelecting) {
      endSelection();
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
      startSelection(e);
    }
  }, [startSelection]);
  
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
  
  // Handle wheel events - prevent zoom when scrolling inside elements
  const handleWheel = useCallback((e: React.WheelEvent) => {
    // Check if the wheel event occurred inside an element
    const targetElement = e.target as HTMLElement;
    const isInsideElement = targetElement.closest('[data-element-id]');
    
    // If we're inside an element, don't zoom
    if (isInsideElement) {
      // Allow normal scroll behavior
      return;
    }
    
    // Otherwise handle zoom (pass to the zoom handler)
    e.preventDefault();
    if (e.deltaY < 0) {
      diagramEngine.zoomIn();
    } else {
      diagramEngine.zoomOut();
    }
  }, []);
  
  return {
    // States
    contextMenuPosition,
    elementForContextMenu,
    isSelecting,
    selectionBox,
    isResizing,
    
    // Actions
    setContextMenuPosition,
    setElementForContextMenu,
    handleCanvasClick,
    handleCanvasContextMenu,
    handleCanvasMouseDown,
    handleElementContextMenu,
    handleElementMouseDown,
    handleRelationshipClick,
    handleRelationshipTypeSelect,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleWheel,
    updateStoreSelection,
    
    // Relationship creation
    isCreatingRelationship,
    tempEndPoint,
    relationshipSourceId,
    relationshipType,
    completeRelationship
  };
};
