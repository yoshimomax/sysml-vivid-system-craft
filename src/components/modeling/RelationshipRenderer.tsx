
import { Element, Position, Relationship, RelationshipType } from "@/types/sysml";
import { calculateConnectionPoints } from "@/utils/elementUtils";
import { useEffect } from "react";

interface RelationshipRendererProps {
  relationships: Relationship[];
  elements: Element[];
  tempRelationship: {
    sourceId: string | null;
    tempEndPoint: Position | null;
    type: RelationshipType;
  };
  selectedRelationship: Relationship | null;
  onRelationshipClick: (e: React.MouseEvent, relationship: Relationship) => void;
}

export const RelationshipRenderer = ({
  relationships,
  elements,
  tempRelationship,
  selectedRelationship,
  onRelationshipClick,
}: RelationshipRendererProps) => {
  // Get the path for drawing a relationship line
  const getRelationshipPath = (relationship: Relationship): string => {
    const source = elements.find(el => el.id === relationship.sourceId);
    const target = elements.find(el => el.id === relationship.targetId);
    
    if (!source || !target) {
      console.error(`Source or target element not found for relationship ${relationship.id}`);
      return "";
    }
    
    // Calculate connection points
    const points = calculateConnectionPoints(source, target);
    
    // Draw path from source to target connection points
    return `M ${points.source.x} ${points.source.y} L ${points.target.x} ${points.target.y}`;
  };
  
  // Debug logging for relationships
  useEffect(() => {
    if (relationships.length > 0) {
      console.log(`Rendering ${relationships.length} relationships`);
    }
  }, [relationships]);
  
  // Get the marker end type based on relationship type
  const getMarkerEnd = (type: RelationshipType): string => {
    switch (type) {
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
  
  // Helper to get element center
  const getElementCenter = (elementId: string): Position => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return { x: 0, y: 0 };
    
    return {
      x: element.position.x + element.size.width / 2,
      y: element.position.y + element.size.height / 2
    };
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
      
      {/* Actual relationships - important to set pointer-events to stroke */}
      <g className="relationships-group">
        {relationships.map(relationship => (
          <path
            key={relationship.id}
            d={getRelationshipPath(relationship)}
            className="relationship-path"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            markerEnd={getMarkerEnd(relationship.type)}
            onClick={(e) => onRelationshipClick(e, relationship)}
            style={{ pointerEvents: 'stroke' }}
          />
        ))}
      </g>
      
      {/* Temporary line for relationship creation */}
      {tempRelationship.sourceId && tempRelationship.tempEndPoint && (
        <path
          className="relationship-path-temp"
          d={`M ${getElementCenter(tempRelationship.sourceId).x} ${getElementCenter(tempRelationship.sourceId).y} L ${tempRelationship.tempEndPoint.x} ${tempRelationship.tempEndPoint.y}`}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="5,5"
          fill="none"
          markerEnd={getMarkerEnd(tempRelationship.type)}
        />
      )}
    </svg>
  );
};
