
import { useState, useCallback, useEffect } from "react";
import { diagramEngine } from "../core/diagram";
import { useElementDrag } from "./useElementDrag";
import { useElementResize } from "./useElementResize";
import { useMultiSelect } from "./useMultiSelect";
import { useRelationshipCreation } from "./useRelationshipCreation";
import { useContextMenu } from "./useContextMenu";
import { useCanvasEvents as useBaseCanvasEvents } from "./useCanvasEvents";
import { useCanvasEvents } from "./interactions/useCanvasEvents";
import { useElementInteraction } from "./interactions/useElementInteraction";
import { useMouseHandlers } from "./interactions/useMouseHandlers";
import { useContextMenuHandler } from "./interactions/useContextMenuHandler";

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
  
  // Use the refactored hooks
  const {
    handleCanvasClick: baseHandleCanvasClick,
    handleRelationshipClick
  } = useCanvasEvents(
    isSelecting,
    isDragging,
    isResizing,
    isCreatingRelationship,
    cancelRelationshipCreation,
    contextMenuPosition,
    setContextMenuPosition,
    setElementForContextMenu
  );
  
  const {
    handleElementMouseDown
  } = useElementInteraction(
    isCreatingRelationship,
    relationshipSourceId,
    completeRelationship,
    isResizeHandleClick,
    startResize,
    handleDragStart
  );
  
  const {
    handleMouseMove,
    handleMouseUp,
    handleCanvasMouseDown,
    handleMouseLeave,
    handleWheel
  } = useMouseHandlers(
    isSelecting,
    updateSelection,
    isCreatingRelationship,
    handleRelationshipMouseMove,
    isDragging,
    handleDrag,
    isResizing,
    handleResize,
    endSelection,
    handleDragEnd,
    endResize,
    cancelSelection,
    startSelection
  );
  
  const {
    handleRelationshipTypeSelect
  } = useContextMenuHandler(
    elementForContextMenu,
    startRelationship,
    setContextMenuPosition,
    setElementForContextMenu
  );
  
  // Update store when local selection changes
  const updateStoreSelection = useCallback(() => {
    if (localSelectedIds && localSelectedIds.length > 0) {
      console.log("Updating store with selection:", localSelectedIds);
      diagramEngine.selectMultipleElements(localSelectedIds);
    }
  }, [localSelectedIds]);
  
  // Wrap the base handle canvas click to provide the canvas ref
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    baseHandleCanvasClick(e, canvasRef);
  }, [baseHandleCanvasClick, canvasRef]);
  
  // Update store when selection changes
  useEffect(() => {
    updateStoreSelection();
  }, [updateStoreSelection]);
  
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
