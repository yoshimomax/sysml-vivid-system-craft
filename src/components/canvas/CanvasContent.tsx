
import React from "react";
import { GridLayer } from "./GridLayer";
import { ElementLayer } from "./ElementLayer";
import { RelationshipLayer } from "./RelationshipLayer";
import { Position } from "../../model/types";

interface CanvasContentProps {
  scale: number;
  contentRef: React.RefObject<HTMLDivElement>;
  isSelecting: boolean;
  selectionBox: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null;
  tempRelationship: {
    sourceId: string | null;
    tempEndPoint: Position | null;
    type: string | null;
  };
  onElementMouseDown: (e: React.MouseEvent, elementId: string) => void;
  onElementContextMenu: (e: React.MouseEvent, elementId: string) => void;
  onRelationshipClick: (e: React.MouseEvent, relationshipId: string) => void;
}

export const CanvasContent: React.FC<CanvasContentProps> = ({
  scale,
  contentRef,
  isSelecting,
  selectionBox,
  tempRelationship,
  onElementMouseDown,
  onElementContextMenu,
  onRelationshipClick
}) => {
  return (
    <div 
      ref={contentRef}
      className="absolute inset-0 canvas-content"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: '0 0'
      }}
    >
      {/* Grid background layer (now without grid) */}
      <GridLayer className="pointer-events-none" />
      
      {/* Relationships layer */}
      <RelationshipLayer
        tempRelationship={tempRelationship}
        onRelationshipClick={onRelationshipClick}
      />
      
      {/* Elements layer */}
      <ElementLayer
        onElementMouseDown={onElementMouseDown}
        onElementContextMenu={onElementContextMenu}
      />
      
      {/* Selection box is now rendered outside the scaled content in ModelingCanvas */}
    </div>
  );
};
