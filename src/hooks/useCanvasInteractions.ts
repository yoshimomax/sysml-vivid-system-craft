import { useState, useRef, useCallback } from "react";
import { Position } from "../model/types";
import { diagramEngine } from "../core/DiagramEngine";
import { useModelingStore } from "../store";
import { useElementDrag } from "./useElementDrag";
import { useMultiSelect } from "./useMultiSelect";
import { useRelationshipCreation } from "./useRelationshipCreation";

export const useCanvasInteractions = (canvasRef: React.RefObject<HTMLDivElement>) => {
  // Context menu state
  const [contextMenuPosition, setContextMenuPosition] = useState<Position | null>(null);
  const [elementForContextMenu, setElementForContextMenu] = useState<string | null>(null);
  
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
  
  // Update store when local selection changes
  const updateStoreSelection = useCallback(() => {
    if (localSelectedIds.length > 0) {
      diagramEngine.selectMultipleElements(localSelectedIds);
    }
  }, [localSelectedIds]);
  
  // Handle canvas click
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      // If relationship creation is in progress, cancel it
      if (isCreatingRelationship) {
        cancelRelationshipCreation();
        return;
      }
      
      // Start multi-selection
      if (!isSelecting && !isDragging) {
        startSelection(e);
        return;
      }
      
      // Otherwise deselect element/relationship
      diagramEngine.selectElement(null);
      diagramEngine.selectRelationship(null);
    }
  }, [canvasRef, isCreatingRelationship, cancelRelationshipCreation, isSelecting, isDragging, startSelection]);
  
  // Handle canvas context menu
  const handleCanvasContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setElementForContextMenu(null);
  }, []);
  
  // Handle element context menu for relationship creation
  const handleElementContextMenu = useCallback((e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setElementForContextMenu(elementId);
  }, []);
  
  // Handle relationship click
  const handleRelationshipClick = useCallback((e: React.MouseEvent, relationshipId: string) => {
    e.stopPropagation();
    diagramEngine.selectRelationship(relationshipId);
  }, []);
  
  // Handle relationship type selection
  const handleRelationshipTypeSelect = useCallback((type: any) => {
    if (elementForContextMenu) {
      startRelationship(elementForContextMenu, type);
    }
    setContextMenuPosition(null);
    setElementForContextMenu(null);
  }, [elementForContextMenu, startRelationship]);
  
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
    }
  }, [isSelecting, updateSelection, isCreatingRelationship, handleRelationshipMouseMove, isDragging, handleDrag, canvasRef]);
  
  // Mouse up handler
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (isSelecting) {
      endSelection();
      return;
    }
    
    handleDragEnd();
  }, [isSelecting, endSelection, handleDragEnd]);
  
  const handleMouseLeave = useCallback(() => {
    handleDragEnd();
    cancelSelection();
  }, [handleDragEnd, cancelSelection]);
  
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
