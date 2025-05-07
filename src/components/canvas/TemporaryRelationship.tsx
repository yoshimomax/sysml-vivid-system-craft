
import React from "react";
import { Position, RelationshipType } from "../../model/types";

interface TemporaryRelationshipProps {
  sourceId: string | null;
  tempEndPoint: Position | null;
  type: string | null;
  elements: any[];
}

export const TemporaryRelationship: React.FC<TemporaryRelationshipProps> = ({
  sourceId,
  tempEndPoint,
  type,
  elements
}) => {
  if (!sourceId || !tempEndPoint || !type) {
    console.debug("Missing data for temporary relationship:", { sourceId, tempEndPoint, type });
    return null;
  }
  
  const source = elements.find(el => el.id === sourceId);
  if (!source) {
    console.debug("Source element not found:", sourceId);
    return null;
  }
  
  console.log("Drawing temporary relationship line from", source.id, "to", tempEndPoint);
  
  const sourceCenter = {
    x: source.position.x + source.size.width / 2,
    y: source.position.y + source.size.height / 2
  };
  
  // Get the marker end type based on relationship type
  const getMarkerEnd = (): string => {
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
        return "url(#satisfy)";
      case "Verify":
        return "url(#verify)";
      case "Allocate":
        return "url(#allocate)";
      default:
        return "url(#arrow)";
    }
  };
  
  return (
    <path
      className="relationship-path-temp"
      d={`M ${sourceCenter.x} ${sourceCenter.y} L ${tempEndPoint.x} ${tempEndPoint.y}`}
      stroke="var(--color-temp-relationship, #0088ff)"
      strokeWidth="1.5"
      strokeDasharray="5,5"
      fill="none"
      markerEnd={getMarkerEnd()}
    />
  );
};
