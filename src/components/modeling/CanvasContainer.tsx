
import React, { useRef } from "react";
import { useElementDragging } from "@/hooks/useElementDragging";
import { useRelationshipCreation } from "@/hooks/useRelationshipCreation";
import { ElementRenderer } from "./ElementRenderer";
import { RelationshipRenderer } from "./RelationshipRenderer";
import { ElementDropHandler } from "./ElementDropHandler";

interface CanvasContainerProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  elements: any[];
  relationships: any[];
  selectedElement: any;
  selectedRelationship: any;
  onElementMouseDown: (e: React.MouseEvent, element: any) => void;
  onElementContextMenu: (e: React.MouseEvent, element: any) => void;
  onRelationshipClick: (e: React.MouseEvent, relationship: any) => void;
  onElementDrop: (newElement: any) => void;
  onCanvasClick: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
}

export const CanvasContainer: React.FC<CanvasContainerProps> = ({
  canvasRef,
  elements,
  relationships,
  selectedElement,
  selectedRelationship,
  onElementMouseDown,
  onElementContextMenu,
  onRelationshipClick,
  onElementDrop,
  onCanvasClick,
  onMouseMove,
  onMouseUp,
  onMouseLeave
}) => {
  // Make sure elements and relationships are arrays
  const elementArray = Array.isArray(elements) ? elements : [];
  const relationshipArray = Array.isArray(relationships) ? relationships : [];

  return (
    <div
      ref={canvasRef}
      className="canvas-wrapper w-full h-full overflow-auto relative"
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onClick={onCanvasClick}
    >
      <ElementDropHandler 
        onElementDrop={onElementDrop} 
        canvasRef={canvasRef}
      >
        <div className="absolute inset-0">
          <RelationshipRenderer
            relationships={relationshipArray}
            elements={elementArray}
            tempRelationship={{
              sourceId: null,  // This will be passed from props
              tempEndPoint: null,
              type: "Dependency" as any
            }}
            selectedRelationship={selectedRelationship}
            onRelationshipClick={onRelationshipClick}
          />
          
          {elementArray.length > 0 && (
            <ElementRenderer
              elements={elementArray}
              selectedElement={selectedElement}
              onElementMouseDown={onElementMouseDown}
              onElementContextMenu={onElementContextMenu}
            />
          )}
        </div>
      </ElementDropHandler>
    </div>
  );
};
