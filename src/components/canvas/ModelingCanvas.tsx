
import React, { useRef } from "react";
import { useModelingStore } from "../../store/modelingStore";
import { diagramEngine } from "../../core/DiagramEngine";
import { GridLayer } from "./GridLayer";
import { ElementLayer } from "./ElementLayer";
import { RelationshipLayer } from "./RelationshipLayer";
import { DropLayer } from "./DropLayer";
import { useElementDrag } from "../../hooks/useElementDrag";
import { useRelationshipCreation } from "../../hooks/useRelationshipCreation";
import "../../styles/modeling.css";

export const ModelingCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  
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
    handleMouseMove: handleRelationshipMouseMove, // Renamed to avoid duplicate declaration
    cancelRelationshipCreation
  } = useRelationshipCreation();
  
  // Handle canvas click - deselect when clicking on the canvas background
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      // If relationship creation is in progress, cancel it
      if (isCreatingRelationship) {
        cancelRelationshipCreation();
        return;
      }
      
      // Otherwise deselect element/relationship
      diagramEngine.selectElement(null);
      diagramEngine.selectRelationship(null);
    }
  };

  // Handle element context menu for relationship creation
  const handleElementContextMenu = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    startRelationship(elementId, "Dependency");
  };
  
  // Handle relationship click
  const handleRelationshipClick = (e: React.MouseEvent, relationshipId: string) => {
    e.stopPropagation();
    diagramEngine.selectRelationship(relationshipId);
  };
  
  // Combined mouse move handler for all interactions
  const handleMouseMove = (e: React.MouseEvent) => {
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
  
  return (
    <div
      ref={canvasRef}
      className="canvas-wrapper w-full h-full overflow-auto relative"
      onMouseMove={handleMouseMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onClick={handleCanvasClick}
    >
      <DropLayer canvasRef={canvasRef}>
        <div className="absolute inset-0">
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
        </div>
      </DropLayer>
    </div>
  );
};
