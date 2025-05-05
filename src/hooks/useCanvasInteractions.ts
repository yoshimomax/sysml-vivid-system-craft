
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
    // Only process if target is the canvas itself
    if (e.target !== canvasRef.current) return;
    
    // If relationship creation is in progress, cancel it
    if (isCreatingRelationship) {
      cancelRelationshipCreation();
      return;
    }
    
    // If not selecting or dragging, deselect all
    if (!isSelecting && !isDragging) {
      diagramEngine.selectElement(null);
      diagramEngine.selectRelationship(null);
      diagramEngine.selectMultipleElements([]);
    }
  }, [canvasRef, isCreatingRelationship, cancelRelationshipCreation, isSelecting, isDragging]);
  
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
    
    if (isDragging) {
      handleDragEnd();
    }
  }, [isSelecting, endSelection, isDragging, handleDragEnd]);
  
  // Mouse down handler for canvas
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    // Only start selection with left mouse button
    if (e.button !== 0) return;
    
    // Only if clicked directly on canvas, not on an element
    if (e.target === canvasRef.current) {
      startSelection(e);
    }
  }, [canvasRef, startSelection]);
  
  const handleMouseLeave = useCallback(() => {
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
