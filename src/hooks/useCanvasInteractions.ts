
import { useState, useCallback, useEffect } from "react";
import { diagramEngine } from "../core/DiagramEngine";
import { useElementDrag } from "./useElementDrag";
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
    baseHandleCanvasClick(e, canvasRef);
  }, [baseHandleCanvasClick, canvasRef]);
  
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
      console.log("Updating selection during mouse move");
      updateSelection(e);
      return;
    }
    
    if (isCreatingRelationship) {
      handleRelationshipMouseMove(e, canvasRef);
      return;
    }
    
    if (isDragging) {
      handleDrag(e, canvasRef);
    }
  }, [isSelecting, updateSelection, isCreatingRelationship, handleRelationshipMouseMove, isDragging, handleDrag, canvasRef]);
  
  // Mouse up handler
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    console.log("Mouse up detected", { isSelecting, isDragging });
    
    if (isSelecting) {
      console.log("Ending selection on mouse up");
      endSelection();
      return;
    }
    
    if (isDragging) {
      handleDragEnd();
      return; // Add return to prevent unintended deselection
    }
  }, [isSelecting, endSelection, isDragging, handleDragEnd]);
  
  // Mouse down handler for canvas
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    console.log("Canvas mouse down", e.target, e.currentTarget);
    
    // Only start selection with left mouse button
    if (e.button !== 0) return;
    
    // Check if click originated from a canvas area, not an element
    const targetElement = e.target as HTMLElement;
    const isElementClick = targetElement.closest('[data-element-id]');
    
    if (!isElementClick) {
      console.log("Starting selection from canvas click");
      e.preventDefault(); // Prevent default to ensure we capture the event
      startSelection(e);
    }
  }, [startSelection]);
  
  const handleMouseLeave = useCallback(() => {
    console.log("Mouse leave detected", { isSelecting, isDragging });
    
    if (isDragging) {
      handleDragEnd();
    }
    
    if (isSelecting) {
      cancelSelection();
    }
  }, [handleDragEnd, cancelSelection, isDragging, isSelecting]);
  
  return {
    // States
    contextMenuPosition,
    elementForContextMenu,
    isSelecting,
    selectionBox,
    
    // Actions
    setContextMenuPosition,
    setElementForContextMenu,
    handleCanvasClick,
    handleCanvasContextMenu,
    handleCanvasMouseDown,
    handleElementContextMenu,
    handleRelationshipClick,
    handleRelationshipTypeSelect,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleDragStart,
    startSelection,
    updateStoreSelection,
    
    // Relationship creation
    isCreatingRelationship,
    tempEndPoint,
    relationshipSourceId,
    relationshipType,
    completeRelationship
  };
};
