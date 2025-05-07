import React from "react";
import { Position, RelationshipType } from "../../model/types";
import { calculateConnectionPoints } from "../../utils/diagramUtils";

interface RelationshipItemProps {
  relationship: any; // Using any to match original implementation
  elements: any[];
  selectedRelationshipId: string | null;
  onRelationshipClick: (e: React.MouseEvent, relationshipId: string) => void;
}

export const RelationshipItem: React.FC<RelationshipItemProps> = ({
  relationship,
  elements,
  selectedRelationshipId,
  onRelationshipClick
}) => {
  // Get the path for a relationship
  const getRelationshipPath = (sourceId: string, targetId: string, waypoints?: Position[]): string => {
    const source = elements.find(el => el.id === sourceId);
    const target = elements.find(el => el.id === targetId);
    
    if (!source || !target) return "";
    
    // If we have custom waypoints, use them
    if (waypoints && waypoints.length > 0) {
      const points = calculateConnectionPoints(source, target, waypoints);
      
      // Start with the source connection point
      let path = `M ${points.source.x} ${points.source.y}`;
      
      // Add all waypoints
      waypoints.forEach(point => {
        path += ` L ${point.x} ${point.y}`;
      });
      
      // End with the target connection point
      path += ` L ${points.target.x} ${points.target.y}`;
      
      return path;
    }
    
    // Otherwise use direct connection
    const points = calculateConnectionPoints(source, target);
    return `M ${points.source.x} ${points.source.y} L ${points.target.x} ${points.target.y}`;
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
      case "Satisfy":
        return "url(#satisfy)"; // Marker for Satisfy
      case "Verify":
        return "url(#verify)";  // Marker for Verify
      case "Allocate":
        return "url(#allocate)"; // Marker for Allocate
      default:
        return "url(#arrow)";
    }
  };
  
  // Get stroke style based on relationship type and properties
  const getStrokeStyle = () => {
    // Default styles
    let dashArray = "none";
    let strokeWidth = relationship.id === selectedRelationshipId ? "3" : "2";
    let color = relationship.id === selectedRelationshipId 
      ? "var(--color-selected)" 
      : relationship.properties?.lineColor || "currentColor";
    
    // Custom line style from relationship properties
    if (relationship.properties?.lineStyle) {
      switch (relationship.properties.lineStyle) {
        case "dashed":
          dashArray = "5,5";
          break;
        case "dotted":
          dashArray = "2,2";
          break;
        default:
          dashArray = "none";
      }
    } else {
      // Default line styles based on relationship type
      switch (relationship.type) {
        case "Dependency":
          dashArray = "5,5";
          break;
        case "Allocate":
          dashArray = "8,2,2,2";
          break;
        default:
          dashArray = "none";
      }
    }
    
    // Use custom line width if specified
    if (relationship.properties?.lineWidth) {
      strokeWidth = relationship.id === selectedRelationshipId
        ? (parseInt(relationship.properties.lineWidth) + 1).toString()
        : relationship.properties.lineWidth.toString();
    }
    
    return {
      strokeDasharray: dashArray,
      strokeWidth,
      stroke: color
    };
  };

  const strokeStyle = getStrokeStyle();
  const pathString = getRelationshipPath(relationship.sourceId, relationship.targetId, relationship.waypoints);

  return (
    <g className="relationship-group">
      <path
        d={pathString}
        className={`relationship-path ${relationship.id === selectedRelationshipId ? 'relationship-selected' : ''}`}
        stroke={strokeStyle.stroke}
        strokeWidth={strokeStyle.strokeWidth}
        strokeDasharray={strokeStyle.strokeDasharray}
        fill="none"
        markerEnd={getMarkerEnd(relationship.type)}
        onClick={(e) => {
          e.stopPropagation();
          onRelationshipClick(e, relationship.id);
        }}
        style={{ pointerEvents: 'stroke' }}
      />
      
      {/* Relationship label if present */}
      {relationship.label && (
        <RelationshipLabel
          sourceId={relationship.sourceId}
          targetId={relationship.targetId}
          waypoints={relationship.waypoints}
          label={relationship.label}
          elements={elements}
        />
      )}
    </g>
  );
};

// Helper component to render relationship labels
interface RelationshipLabelProps {
  sourceId: string;
  targetId: string;
  waypoints?: Position[];
  label: string;
  elements: any[];
}

const RelationshipLabel: React.FC<RelationshipLabelProps> = ({
  sourceId,
  targetId,
  waypoints,
  label,
  elements
}) => {
  const source = elements.find(el => el.id === sourceId);
  const target = elements.find(el => el.id === targetId);
  
  if (!source || !target) return null;
  
  // Calculate label position - in the middle of the relationship
  // If waypoints exist, place at middle waypoint
  // Otherwise, calculate midpoint between source and target
  let labelPosition: Position;
  
  if (waypoints && waypoints.length > 0) {
    // Get middle waypoint
    const midPointIndex = Math.floor(waypoints.length / 2);
    labelPosition = waypoints[midPointIndex];
  } else {
    // Calculate midpoint
    labelPosition = {
      x: (source.position.x + target.position.x) / 2,
      y: (source.position.y + target.position.y) / 2
    };
  }
  
  return (
    <foreignObject
      x={labelPosition.x - 50}
      y={labelPosition.y - 12}
      width="100"
      height="24"
      style={{ pointerEvents: "none" }}
    >
      <div
        className="relationship-label"
        style={{
          backgroundColor: "white",
          padding: "2px 4px",
          border: "1px solid #ddd",
          borderRadius: "4px",
          fontSize: "11px",
          textAlign: "center",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }}
      >
        {label}
      </div>
    </foreignObject>
  );
};
