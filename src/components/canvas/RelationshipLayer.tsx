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
      case "Satisfy":
        return "url(#satisfy)"; // New marker for Satisfy
      case "Verify":
        return "url(#verify)";  // New marker for Verify
      case "Allocate":
        return "url(#allocate)"; // New marker for Allocate
      default:
        return "url(#arrow)";
    }
  };
  
  // Get stroke style based on relationship type and properties
  const getStrokeStyle = (relationship: any) => {
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
  
  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
      {/* SVG marker definitions */}
      <defs>
        {/* Arrow marker */}
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
        
        {/* Triangle marker (empty) */}
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
        
        {/* Diamond marker */}
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
        
        {/* Satisfy marker */}
        <marker
          id="satisfy"
          viewBox="0 0 12 12"
          refX="10"
          refY="6"
          markerWidth="8"
          markerHeight="8"
          orient="auto-start-reverse"
        >
          <path d="M 0 6 L 10 6 M 5 2 L 10 6 L 5 10" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </marker>
        
        {/* Verify marker */}
        <marker
          id="verify"
          viewBox="0 0 12 12"
          refX="10"
          refY="6"
          markerWidth="8"
          markerHeight="8"
          orient="auto-start-reverse"
        >
          <path d="M 1 1 L 6 11 L 11 1" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </marker>
        
        {/* Allocate marker */}
        <marker
          id="allocate"
          viewBox="0 0 14 14"
          refX="11"
          refY="7"
          markerWidth="9"
          markerHeight="9"
          orient="auto-start-reverse"
        >
          <circle cx="7" cy="7" r="5" fill="white" stroke="currentColor" strokeWidth="1.5" />
          <path d="M 4 7 L 10 7" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </marker>
      </defs>
      
      {/* Actual relationships */}
      <g className="relationships-group">
        {relationships.map(relationship => {
          const strokeStyle = getStrokeStyle(relationship);
          
          return (
            <g key={relationship.id} className="relationship-group">
              <path
                d={getRelationshipPath(relationship.sourceId, relationship.targetId, relationship.waypoints)}
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
                />
              )}
            </g>
          );
        })}
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

// Helper component to render relationship labels
interface RelationshipLabelProps {
  sourceId: string;
  targetId: string;
  waypoints?: Position[];
  label: string;
}

const RelationshipLabel: React.FC<RelationshipLabelProps> = ({
  sourceId,
  targetId,
  waypoints,
  label
}) => {
  const activeDiagram = useModelingStore(state => state.getActiveDiagram());
  const elements = activeDiagram?.elements || [];
  
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
