
import { useState } from "react";
import { Position, RelationshipType } from "../model/types";
import { useModelingStore } from "../store/modelingStore";
import { diagramEngine } from "../core/DiagramEngine";

export const useRelationshipCreation = () => {
  const [tempEndPoint, setTempEndPoint] = useState<Position | null>(null);
  const isCreatingRelationship = useModelingStore(state => state.isCreatingRelationship);
  const relationshipSourceId = useModelingStore(state => state.relationshipSourceId);
  const relationshipType = useModelingStore(state => state.relationshipType);
  
  /**
   * Start creating a relationship
   */
  const startRelationship = (sourceId: string, type: RelationshipType) => {
    diagramEngine.startRelationshipCreation(sourceId, type);
  };
  
  /**
   * Handle mouse movement during relationship creation
   */
  const handleMouseMove = (e: React.MouseEvent, canvasRef: React.RefObject<HTMLDivElement>) => {
    if (!isCreatingRelationship) return;
    
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    setTempEndPoint({
      x: e.clientX - canvasRect.left + (canvasRef.current?.scrollLeft || 0),
      y: e.clientY - canvasRect.top + (canvasRef.current?.scrollTop || 0)
    });
  };
  
  /**
   * Cancel relationship creation
   */
  const cancelRelationshipCreation = () => {
    diagramEngine.cancelRelationshipCreation();
    setTempEndPoint(null);
  };
  
  /**
   * Complete relationship creation by connecting to target
   */
  const completeRelationship = (targetId: string) => {
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
