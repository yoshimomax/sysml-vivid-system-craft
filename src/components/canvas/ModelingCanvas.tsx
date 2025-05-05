
import React, { useRef, useState } from "react";
import { useModelingStore } from "../../store/modelingStore";
import { diagramEngine } from "../../core/DiagramEngine";
import { GridLayer } from "./GridLayer";
import { ElementLayer } from "./ElementLayer";
import { RelationshipLayer } from "./RelationshipLayer";
import { DropLayer } from "./DropLayer";
import { useElementDrag } from "../../hooks/useElementDrag";
import { useRelationshipCreation } from "../../hooks/useRelationshipCreation";
import { useZoom } from "../../hooks/useZoom";
import { useMultiSelect } from "../../hooks/useMultiSelect";
import { MinimapPanel } from "./MinimapPanel";
import { SelectionActionPanel } from "./SelectionActionPanel";
import { RelationshipCreator } from "./RelationshipCreator";
import { Position, RelationshipType } from "../../model/types";
import "../../styles/modeling.css";

export const ModelingCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<Position | null>(null);
  const [elementForContextMenu, setElementForContextMenu] = useState<string | null>(null);
  
  // Get states from store
  const scale = useModelingStore(state => state.scale);
  const setScale = useModelingStore(state => state.setScale);
  const selectedElementIds = useModelingStore(state => state.selectedElementIds);
  
  // Zoom hooks
  const {
    scale: localScale,
    zoomIn,
    zoomOut,
    resetZoom,
    handleWheelZoom,
    setScale: setLocalScale
  } = useZoom();
  
  // Sync local scale with store
  React.useEffect(() => {
    setScale(localScale);
  }, [localScale, setScale]);
  
  // Element dragging hooks
  const {
    isDragging,
    handleDragStart,
    handleDrag,
    handleDragEnd
  } = useElementDrag();
  
  // Relationship creation hooks
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
  
  // Multi-select hooks
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
  
  // Update store's selectedElementIds when local selection changes
  React.useEffect(() => {
    if (localSelectedIds.length > 0) {
      diagramEngine.selectMultipleElements(localSelectedIds);
    }
  }, [localSelectedIds]);
  
  // Handle canvas click - deselect when clicking on the canvas background
  const handleCanvasClick = (e: React.MouseEvent) => {
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
  };
  
  // Handle canvas context menu
  const handleCanvasContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setElementForContextMenu(null);
  };
  
  // Handle element context menu for relationship creation
  const handleElementContextMenu = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setElementForContextMenu(elementId);
  };
  
  // Handle relationship click
  const handleRelationshipClick = (e: React.MouseEvent, relationshipId: string) => {
    e.stopPropagation();
    diagramEngine.selectRelationship(relationshipId);
  };
  
  // Handle relationship type selection from context menu
  const handleRelationshipTypeSelect = (type: RelationshipType) => {
    if (elementForContextMenu) {
      startRelationship(elementForContextMenu, type);
    }
    setContextMenuPosition(null);
    setElementForContextMenu(null);
  };
  
  // Handle alignment of multiple elements
  const handleAlignElements = (direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    diagramEngine.alignElements(selectedElementIds, direction);
  };
  
  // Handle deletion of multiple elements
  const handleDeleteMultipleElements = () => {
    diagramEngine.deleteMultipleElements(selectedElementIds);
  };
  
  // Combined mouse move handler for all interactions
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isSelecting) {
      updateSelection(e);
      return;
    }
    
    // Handle relationship creation mouse move
    if (isCreatingRelationship) {
      handleRelationshipMouseMove(e, canvasRef);
      return;
    }
    
    // Handle element dragging
    if (isDragging) {
      handleDrag(e, canvasRef);
    }
  };
  
  // Mouse up handler
  const handleMouseUp = (e: React.MouseEvent) => {
    if (isSelecting) {
      endSelection();
      return;
    }
    
    handleDragEnd();
  };
  
  return (
    <div className="flex h-full">
      <div
        ref={canvasRef}
        className="canvas-wrapper flex-1 overflow-auto relative"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          handleDragEnd();
          cancelSelection();
        }}
        onClick={handleCanvasClick}
        onContextMenu={handleCanvasContextMenu}
        onWheel={handleWheelZoom}
      >
        {/* Multi-selection action panel */}
        <SelectionActionPanel
          selectedIds={selectedElementIds}
          onDelete={handleDeleteMultipleElements}
          onAlign={handleAlignElements}
        />
        
        {/* Relationship type selector context menu */}
        <RelationshipCreator
          visible={!!contextMenuPosition && !!elementForContextMenu}
          position={contextMenuPosition || { x: 0, y: 0 }}
          onSelectType={handleRelationshipTypeSelect}
          onCancel={() => setContextMenuPosition(null)}
        />
        
        <DropLayer canvasRef={canvasRef}>
          <div 
            ref={contentRef}
            className="absolute inset-0"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: '0 0'
            }}
          >
            {/* Grid background layer */}
            <GridLayer />
            
            {/* Relationships layer */}
            <RelationshipLayer
              tempRelationship={{
                sourceId: relationshipSourceId,
                tempEndPoint,
                type: relationshipType
              }}
              onRelationshipClick={handleRelationshipClick}
            />
            
            {/* Elements layer */}
            <ElementLayer
              onElementMouseDown={(e, elementId) => handleDragStart(e, elementId, canvasRef)}
              onElementContextMenu={handleElementContextMenu}
            />
            
            {/* Selection box visualization */}
            {isSelecting && selectionBox && (
              <div 
                className="absolute border-2 border-blue-500 bg-blue-500/10"
                style={{
                  left: Math.min(selectionBox.startX, selectionBox.endX),
                  top: Math.min(selectionBox.startY, selectionBox.endY),
                  width: Math.abs(selectionBox.endX - selectionBox.startX),
                  height: Math.abs(selectionBox.endY - selectionBox.startY),
                }}
              />
            )}
          </div>
        </DropLayer>
      </div>
      
      {/* Minimap panel */}
      <div className="w-48 border-l border-border p-2 flex flex-col space-y-2">
        <MinimapPanel
          canvasRef={canvasRef}
          scale={scale}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onReset={resetZoom}
        />
      </div>
    </div>
  );
};
