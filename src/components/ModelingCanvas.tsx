
import { useRef } from "react";
import { Element, Relationship } from "@/types/sysml";
import { ElementRenderer } from "./modeling/ElementRenderer";
import { RelationshipRenderer } from "./modeling/RelationshipRenderer";
import { useElementDragging } from "@/hooks/useElementDragging";
import { useRelationshipCreation } from "@/hooks/useRelationshipCreation";
import { ElementDropHandler } from "./modeling/ElementDropHandler";
import "../styles/modeling.css";

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
  
  // Make sure elements and relationships are arrays
  const elementArray = Array.isArray(elements) ? elements : [];
  const relationshipArray = Array.isArray(relationships) ? relationships : [];
  
  // Use the element dragging hook
  const { isDragging, startDragging, handleDragging, stopDragging } = useElementDragging({
    elements: elementArray,
    setElements
  });
  
  // Use the relationship creation hook
  const { 
    isCreatingRelationship,
    relationshipSource,
    relationshipType,
    tempEndPoint,
    startRelationship,
    createRelationship,
    handleCanvasMouseMove,
    resetRelationshipCreation
  } = useRelationshipCreation({
    elements: elementArray,
    relationships: relationshipArray,
    setRelationships,
    setSelectedRelationship
  });

  const handleElementMouseDown = (e: React.MouseEvent, element: Element) => {
    e.stopPropagation();
    
    // If we're creating a relationship
    if (isCreatingRelationship) {
      e.preventDefault();
      // If we already have a source, this is the target
      if (relationshipSource && relationshipSource !== element.id) {
        createRelationship(relationshipSource, element.id);
        resetRelationshipCreation();
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
      resetRelationshipCreation();
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
      handleCanvasMouseMove(e, canvasRef);
      return;
    }
    
    // Handle element dragging
    if (isDragging && selectedElement) {
      handleDragging(e, selectedElement.id, canvasRef);
    }
  };

  const handleElementDrop = (newElement: Element) => {
    console.log('Element dropped:', newElement);
    setElements(prevElements => {
      const elements = Array.isArray(prevElements) ? prevElements : [];
      return [...elements, newElement];
    });
    setSelectedElement(newElement);
  };

  return (
    <div
      ref={canvasRef}
      className="canvas-wrapper w-full h-full overflow-auto relative"
      onMouseMove={handleMouseMove}
      onMouseUp={stopDragging}
      onMouseLeave={stopDragging}
      onClick={handleCanvasClick}
    >
      <ElementDropHandler 
        onElementDrop={handleElementDrop} 
        canvasRef={canvasRef}
      >
        <div className="absolute inset-0">
          <RelationshipRenderer
            relationships={relationshipArray}
            elements={elementArray}
            tempRelationship={{
              sourceId: relationshipSource,
              tempEndPoint,
              type: relationshipType
            }}
            selectedRelationship={selectedRelationship}
            onRelationshipClick={handleRelationshipClick}
          />
          
          <ElementRenderer
            elements={elementArray}
            selectedElement={selectedElement}
            onElementMouseDown={handleElementMouseDown}
            onElementContextMenu={handleElementContextMenu}
          />
        </div>
      </ElementDropHandler>
    </div>
  );
};

export default ModelingCanvas;
