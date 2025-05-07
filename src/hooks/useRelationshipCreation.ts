
import { useState } from "react";
import { Position, RelationshipType } from "../model/types";
import { useModelingStore } from "../store/modelingStore";
import { diagramEngine } from "../core/diagram";

export const useRelationshipCreation = () => {
  const [tempEndPoint, setTempEndPoint] = useState<Position | null>(null);
  const isCreatingRelationship = useModelingStore(state => state.isCreatingRelationship);
  const relationshipSourceId = useModelingStore(state => state.relationshipSourceId);
  const relationshipType = useModelingStore(state => state.relationshipType);
  
  /**
   * Start creating a relationship
   */
  const startRelationship = (sourceId: string, type: RelationshipType) => {
    console.log("Starting relationship creation from", sourceId, "with type", type);
    diagramEngine.startRelationshipCreation(sourceId, type);
  };
  
  /**
   * Handle mouse movement during relationship creation
   */
  const handleMouseMove = (e: React.MouseEvent, canvasRef: React.RefObject<HTMLDivElement>) => {
    if (!isCreatingRelationship || !relationshipSourceId) return;
    
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    // Calculate position relative to canvas
    const x = e.clientX - canvasRect.left + (canvasRef.current?.scrollLeft || 0);
    const y = e.clientY - canvasRect.top + (canvasRef.current?.scrollTop || 0);
    
    // Set the temporary end point
    const newEndPoint = { x, y };
    setTempEndPoint(newEndPoint);
    console.log("Updated temporary endpoint to", newEndPoint);
  };
  
  /**
   * Cancel relationship creation
   */
  const cancelRelationshipCreation = () => {
    console.log("Cancelling relationship creation");
    diagramEngine.cancelRelationshipCreation();
    setTempEndPoint(null);
  };
  
  /**
   * Complete relationship creation by connecting to target
   */
  const completeRelationship = (targetId: string) => {
    console.log("Completing relationship to", targetId);
    diagramEngine.completeRelationshipCreation(targetId);
    setTempEndPoint(null);
  };
  
  return {
    isCreatingRelationship,
    relationshipSourceId,
    relationshipType,
    tempEndPoint,
    startRelationship,
    handleMouseMove,
    cancelRelationshipCreation,
    completeRelationship
  };
};
