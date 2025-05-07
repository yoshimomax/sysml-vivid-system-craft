
import React from "react";
import { useModelingStore } from "../../store/modelingStore";
import { RelationshipMarkers } from "./RelationshipMarkers";
import { RelationshipItem } from "./RelationshipItem";
import { TemporaryRelationship } from "./TemporaryRelationship";

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
  
  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
      {/* SVG marker definitions */}
      <RelationshipMarkers />
      
      {/* Actual relationships */}
      <g className="relationships-group">
        {relationships.map(relationship => (
          <RelationshipItem
            key={relationship.id}
            relationship={relationship}
            elements={elements}
            selectedRelationshipId={selectedRelationshipId}
            onRelationshipClick={onRelationshipClick}
          />
        ))}
      </g>
      
      {/* Temporary line for relationship creation */}
      <TemporaryRelationship
        sourceId={tempRelationship.sourceId}
        tempEndPoint={tempRelationship.tempEndPoint}
        type={tempRelationship.type}
        elements={elements}
      />
    </svg>
  );
};

// Import the Position type at the top of the file
import { Position } from "../../model/types";
