
import React, { useRef, useEffect } from "react";
import { Element, Relationship } from "@/types/sysml";
import { useElementDragging } from "@/hooks/useElementDragging";
import { useRelationshipCreation } from "@/hooks/useRelationshipCreation";
import { CanvasContainer } from "./CanvasContainer";

interface ModelingCanvasProps {
  elements: Element[];
  setElements: React.Dispatch<React.SetStateAction<Element[]>>;
  relationships: Relationship[];
  setRelationships: React.Dispatch<React.SetStateAction<Relationship[]>>;
  selectedElement: Element | null;
  setSelectedElement: React.Dispatch<React.SetStateAction<Element | null>>;
  selectedRelationship: Relationship | null;
  setSelectedRelationship: React.Dispatch<React.SetStateAction<Relationship | null>>;
}

const ModelingCanvas = ({
  elements,
  setElements,
  relationships,
  setRelationships,
  selectedElement,
  setSelectedElement,
  selectedRelationship,
  setSelectedRelationship
}: ModelingCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Use the element dragging hook
  const { isDragging, startDragging, handleDragging, stopDragging } = useElementDragging({
    elements: elements,
    setElements
  });
  
  // Use the relationship creation hook
  const { 
    isCreatingRelationship,
    relationshipSourceId,
    relationshipType,
    tempEndPoint,
    startRelationship,
    handleMouseMove: handleRelationshipMouseMove,
    cancelRelationshipCreation,
    completeRelationship
  } = useRelationshipCreation();

  useEffect(() => {
    console.log("Elements in ModelingCanvas updated:", elements);
  }, [elements]);

  const handleElementMouseDown = (e: React.MouseEvent, element: Element) => {
    e.stopPropagation();
    
    // If we're creating a relationship
    if (isCreatingRelationship) {
      e.preventDefault();
      // If we already have a source, this is the target
      if (relationshipSourceId) {
        completeRelationship(element.id);
      }
      return;
    }
    
    setSelectedElement(element);
    setSelectedRelationship(null); // Deselect relationship when selecting an element
    startDragging(e, element, canvasRef);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // If we're creating a relationship but clicked on the canvas, cancel the operation
    if (isCreatingRelationship && e.target === canvasRef.current) {
      cancelRelationshipCreation();
      return;
    }
    
    // Deselect when clicking on the canvas background
    if (e.target === canvasRef.current) {
      setSelectedElement(null);
      setSelectedRelationship(null);
    }
  };

  // Handle element context menu for relationship creation
  const handleElementContextMenu = (e: React.MouseEvent, element: Element) => {
    e.preventDefault();
    console.log(`Right-clicked on element: ${element.id}`);
    startRelationship(element.id, "Dependency");
  };

  // Handle relationship click
  const handleRelationshipClick = (e: React.MouseEvent, relationship: Relationship) => {
    e.stopPropagation();
    console.log(`Clicked on relationship: ${relationship.id}`);
    setSelectedElement(null);
    setSelectedRelationship(relationship);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Handle relationship creation mouse move
    if (isCreatingRelationship) {
      handleRelationshipMouseMove(e, canvasRef);
      return;
    }
    
    // Handle element dragging
    if (isDragging && selectedElement) {
      handleDragging(e, selectedElement.id, canvasRef);
    }
  };

  const handleElementDrop = (newElement: Element) => {
    console.log('Element dropped:', newElement);
    setElements(prev => {
      const prevArray = Array.isArray(prev) ? prev : [];
      const newElements = [...prevArray, newElement];
      console.log('Updated elements array:', newElements);
      return newElements;
    });
    setSelectedElement(newElement);
  };

  return (
    <CanvasContainer
      canvasRef={canvasRef}
      elements={elements}
      relationships={relationships}
      selectedElement={selectedElement}
      selectedRelationship={selectedRelationship}
      onElementMouseDown={handleElementMouseDown}
      onElementContextMenu={handleElementContextMenu}
      onRelationshipClick={handleRelationshipClick}
      onElementDrop={handleElementDrop}
      onCanvasClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
      onMouseUp={stopDragging}
      onMouseLeave={stopDragging}
    />
  );
};

export default ModelingCanvas;
