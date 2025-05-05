
import React from "react";
import { useModelingStore } from "../../store/modelingStore";
import { Position, RelationshipType } from "../../model/types";
import { calculateConnectionPoints } from "../../utils/diagramUtils";

interface RelationshipLayerProps {
  tempRelationship: {
    sourceId: string | null;
    tempEndPoint: Position | null;
    type: string | null;
  };
  onRelationshipClick: (e: React.MouseEvent, relationshipId: string) => void;
}

export const RelationshipLayer: React.FC<RelationshipLayerProps> = ({
  tempRelationship,
  onRelationshipClick
}) => {
  const activeDiagram = useModelingStore(state => state.getActiveDiagram());
  const relationships = activeDiagram?.relationships || [];
  const elements = activeDiagram?.elements || [];
  const selectedRelationshipId = useModelingStore(state => state.selectedRelationshipId);
  
  // Get the path for a relationship
  const getRelationshipPath = (sourceId: string, targetId: string): string => {
    const source = elements.find(el => el.id === sourceId);
    const target = elements.find(el => el.id === targetId);
    
    if (!source || !target) return "";
    
    const points = calculateConnectionPoints(source, target);
    return `M ${points.source.x} ${points.source.y} L ${points.target.x} ${points.target.y}`;
  };
  
  // Get temporary relationship path
  const getTempRelationshipPath = (): string => {
    const { sourceId, tempEndPoint } = tempRelationship;
    if (!sourceId || !tempEndPoint) return "";
    
    const source = elements.find(el => el.id === sourceId);
    if (!source) return "";
    
    const sourceCenter = {
      x: source.position.x + source.size.width / 2,
      y: source.position.y + source.size.height / 2
    };
    
    return `M ${sourceCenter.x} ${sourceCenter.y} L ${tempEndPoint.x} ${tempEndPoint.y}`;
  };
  
  // Get the marker end type based on relationship type
  const getMarkerEnd = (type: string): string => {
    switch (type as RelationshipType) {
      case "Specialization":
        return "url(#triangle)";
      case "Dependency":
        return "url(#arrow)";
      case "Containment":
        return "url(#diamond)";
      case "Reference":
        return "url(#arrow)";
      default:
        return "url(#arrow)";
    }
  };
  
  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
      {/* SVG marker definitions */}
      <defs>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
        <marker
          id="triangle"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="white" stroke="currentColor" strokeWidth="1" />
        </marker>
        <marker
          id="diamond"
          viewBox="0 0 12 12"
          refX="6"
          refY="6"
          markerWidth="8"
          markerHeight="8"
          orient="auto-start-reverse"
        >
          <path d="M 0 6 L 6 0 L 12 6 L 6 12 z" fill="white" stroke="currentColor" strokeWidth="1" />
        </marker>
      </defs>
      
      {/* Actual relationships */}
      <g className="relationships-group">
        {relationships.map(relationship => (
          <path
            key={relationship.id}
            d={getRelationshipPath(relationship.sourceId, relationship.targetId)}
            className={`relationship-path ${relationship.id === selectedRelationshipId ? 'relationship-selected' : ''}`}
            stroke={relationship.id === selectedRelationshipId ? "var(--color-selected)" : "currentColor"}
            strokeWidth={relationship.id === selectedRelationshipId ? "3" : "2"}
            fill="none"
            markerEnd={getMarkerEnd(relationship.type)}
            onClick={(e) => {
              e.stopPropagation();
              onRelationshipClick(e, relationship.id);
            }}
            style={{ pointerEvents: 'stroke' }}
          />
        ))}
      </g>
      
      {/* Temporary line for relationship creation */}
      {tempRelationship.sourceId && tempRelationship.tempEndPoint && tempRelationship.type && (
        <path
          className="relationship-path-temp"
          d={getTempRelationshipPath()}
          stroke="var(--color-temp-relationship)"
          strokeWidth="1.5"
          strokeDasharray="5,5"
          fill="none"
          markerEnd={getMarkerEnd(tempRelationship.type)}
        />
      )}
    </svg>
  );
};
