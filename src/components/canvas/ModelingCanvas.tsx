
import React, { useRef, useState, useEffect } from "react";
import { useModelingStore } from "../../store/modelingStore";
import { useZoom } from "../../hooks/useZoom";
import { useCanvasInteractions } from "../../hooks/useCanvasInteractions";
import { useAlignmentActions } from "../../hooks/useAlignmentActions";
import { CanvasContent } from "./CanvasContent";
import { DropLayer } from "./DropLayer";
import { MinimapPanel } from "./MinimapPanel";
import { SelectionActionPanel } from "./SelectionActionPanel";
import { ContextMenuManager } from "./ContextMenuManager";
import { HelpTooltip } from "./HelpTooltip";
import "../../styles/modeling.css";

export const ModelingCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [showHelp, setShowHelp] = useState(true); // Show help tooltip by default
  
  // Hide help tooltip after 10 seconds
  useEffect(() => {
    if (showHelp) {
      const timer = setTimeout(() => setShowHelp(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [showHelp]);
  
  // Get states from store
  const scale = useModelingStore(state => state.scale);
  const setScale = useModelingStore(state => state.setScale);
  
  // Get hooks
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
  
  // Canvas interactions hook
  const {
    contextMenuPosition,
    setContextMenuPosition,
    elementForContextMenu,
    isSelecting,
    selectionBox,
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
    updateStoreSelection,
    isCreatingRelationship,
    tempEndPoint,
    relationshipSourceId,
    relationshipType
  } = useCanvasInteractions(canvasRef);
  
  // Alignment actions hook
  const {
    selectedElementIds,
    handleAlignElements,
    handleDeleteMultipleElements
  } = useAlignmentActions();
  
  // Update store when selection changes
  useEffect(() => {
    updateStoreSelection();
  }, [updateStoreSelection]);
  
  console.log("ModelingCanvas render", {isSelecting, selectionBox, selectedElementIds});
  
  return (
    <div className="flex h-full">
      <div
        ref={canvasRef}
        className="canvas-wrapper flex-1 overflow-auto relative"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClick={handleCanvasClick}
        onContextMenu={handleCanvasContextMenu}
        onWheel={handleWheelZoom}
      >
        {/* Help tooltip */}
        <HelpTooltip visible={showHelp} />
        
        {/* Multi-selection action panel */}
        {selectedElementIds.length > 1 && (
          <SelectionActionPanel
            selectedIds={selectedElementIds}
            onDelete={handleDeleteMultipleElements}
            onAlign={handleAlignElements}
          />
        )}
        
        {/* Context menu for relationship creation */}
        <ContextMenuManager
          contextMenuPosition={contextMenuPosition}
          elementForContextMenu={elementForContextMenu}
          onSelectRelationshipType={handleRelationshipTypeSelect}
          onCancel={() => setContextMenuPosition(null)}
        />
        
        <DropLayer canvasRef={canvasRef}>
          <CanvasContent
            scale={scale}
            contentRef={contentRef}
            isSelecting={isSelecting}
            selectionBox={selectionBox}
            tempRelationship={{
              sourceId: relationshipSourceId,
              tempEndPoint,
              type: relationshipType
            }}
            onElementMouseDown={(e, elementId) => handleDragStart(e, elementId, canvasRef)}
            onElementContextMenu={handleElementContextMenu}
            onRelationshipClick={handleRelationshipClick}
          />
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
