
import React from "react";
import { Position, Element, RelationshipType } from "@/model/types";

interface TemporaryRelationshipProps {
  sourceId: string | null;
  tempEndPoint: Position | null;
  type: RelationshipType;
  elements: Element[];
}

export const TemporaryRelationship: React.FC<TemporaryRelationshipProps> = ({
  sourceId,
  tempEndPoint,
  type,
  elements
}) => {
  if (!sourceId || !tempEndPoint) return null;
  
  const sourceElement = elements.find(el => el.id === sourceId);
  if (!sourceElement) return null;
  
  const sourceCenter = {
    x: sourceElement.position.x + sourceElement.size.width / 2,
    y: sourceElement.position.y + sourceElement.size.height / 2
  };
  
  // Get marker end based on relationship type
  const getMarkerEnd = (): string => {
    switch (type) {
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
      stroke="var(--color-temp-relationship)"
      strokeWidth="1.5"
      strokeDasharray="5,5"
      fill="none"
      markerEnd={getMarkerEnd()}
    />
  );
};
