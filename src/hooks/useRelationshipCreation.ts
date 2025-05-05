
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Element, Position, Relationship, RelationshipType } from "@/types/sysml";
import { calculateConnectionPoints } from "@/utils/elementUtils";
import { useToast } from "@/components/ui/use-toast";

interface UseRelationshipCreationProps {
  elements: Element[];
  relationships: Relationship[];
  setRelationships: (relationships: Relationship[]) => void;
  setSelectedRelationship: (relationship: Relationship | null) => void;
}

export const useRelationshipCreation = ({
  elements,
  relationships,
  setRelationships,
  setSelectedRelationship,
}: UseRelationshipCreationProps) => {
  const [isCreatingRelationship, setIsCreatingRelationship] = useState(false);
  const [relationshipSource, setRelationshipSource] = useState<string | null>(null);
  const [relationshipType, setRelationshipType] = useState<RelationshipType>("Dependency");
  const [tempEndPoint, setTempEndPoint] = useState<Position | null>(null);
  const { toast } = useToast();

  // Start creating a relationship from an element
  const startRelationship = (elementId: string, type: RelationshipType) => {
    console.log(`Starting relationship from element: ${elementId}`);
    setIsCreatingRelationship(true);
    setRelationshipSource(elementId);
    setRelationshipType(type);
  };

  // Create a relationship between two elements
  const createRelationship = (sourceId: string, targetId: string) => {
    console.log(`Creating relationship: ${sourceId} -> ${targetId}`);
    const sourceElement = elements.find(el => el.id === sourceId);
    const targetElement = elements.find(el => el.id === targetId);
    
    if (!sourceElement || !targetElement) {
      console.error("Source or target element not found");
      return;
    }
    
    // Calculate connection points
    const points = calculateConnectionPoints(sourceElement, targetElement);
    
    const newRelationship: Relationship = {
      id: uuidv4(),
      type: relationshipType,
      sourceId,
      targetId,
      name: `${relationshipType} Relationship`,
      points: [points.source, points.target]
    };
    
    console.log("New relationship:", newRelationship);
    setRelationships([...relationships, newRelationship]);
    setSelectedRelationship(newRelationship);
    
    toast({
      title: "Relationship created",
      description: `Created new ${relationshipType} relationship`,
    });
  };

  // Handle canvas mouse move for temporary relationship
  const handleCanvasMouseMove = (e: React.MouseEvent, canvasRef: React.RefObject<HTMLDivElement>) => {
    if (isCreatingRelationship && relationshipSource) {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;
      
      setTempEndPoint({
        x: e.clientX - canvasRect.left,
        y: e.clientY - canvasRect.top
      });
    }
  };

  // Reset relationship creation state
  const resetRelationshipCreation = () => {
    setIsCreatingRelationship(false);
    setRelationshipSource(null);
    setTempEndPoint(null);
  };

  return {
    isCreatingRelationship,
    relationshipSource,
    relationshipType,
    tempEndPoint,
    startRelationship,
    createRelationship,
    handleCanvasMouseMove,
    resetRelationshipCreation
  };
};
