
import { useState, useRef } from "react";
import { Element, Position, ElementType, Relationship, RelationshipType } from "@/types/sysml";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/components/ui/use-toast";
import { ElementRenderer } from "./modeling/ElementRenderer";
import { RelationshipRenderer } from "./modeling/RelationshipRenderer";
import { getDefaultSizeForType, calculateConnectionPoint } from "@/utils/elementUtils";
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
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // State for relationship creation
  const [isCreatingRelationship, setIsCreatingRelationship] = useState(false);
  const [relationshipSource, setRelationshipSource] = useState<string | null>(null);
  const [relationshipType, setRelationshipType] = useState<RelationshipType>("Dependency");
  const [tempEndPoint, setTempEndPoint] = useState<Position | null>(null);

  // Handle element drop from sidebar
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const elementType = e.dataTransfer.getData("application/sysml-element") as ElementType;
    
    if (!elementType) return;
    
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;
    
    const newElement: Element = {
      id: uuidv4(),
      type: elementType,
      name: `New ${elementType}`,
      position: { x, y },
      size: getDefaultSizeForType(elementType),
    };
    
    setElements([...elements, newElement]);
    setSelectedElement(newElement);
    
    toast({
      title: "Element added",
      description: `Added new ${elementType} element to the diagram`,
    });
  };

  const handleElementMouseDown = (e: React.MouseEvent, element: Element) => {
    e.stopPropagation();
    // If we're creating a relationship
    if (isCreatingRelationship) {
      e.preventDefault();
      // If we already have a source, this is the target
      if (relationshipSource && relationshipSource !== element.id) {
        createRelationship(relationshipSource, element.id);
        setIsCreatingRelationship(false);
        setRelationshipSource(null);
        setTempEndPoint(null);
      }
      return;
    }
    
    setSelectedElement(element);
    setIsDragging(true);
    
    // Calculate offset from element position to mouse position
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    const mouseX = e.clientX - canvasRect.left;
    const mouseY = e.clientY - canvasRect.top;
    
    setDragOffset({
      x: mouseX - element.position.x,
      y: mouseY - element.position.y
    });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    // Update temporary end point for relationship line
    if (isCreatingRelationship && relationshipSource) {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;
      
      setTempEndPoint({
        x: e.clientX - canvasRect.left,
        y: e.clientY - canvasRect.top
      });
      return;
    }
    
    // Handle element dragging
    if (!isDragging || !selectedElement) return;
    
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    const mouseX = e.clientX - canvasRect.left;
    const mouseY = e.clientY - canvasRect.top;
    
    // Update element position
    setElements(elements.map(el => {
      if (el.id === selectedElement.id) {
        return {
          ...el,
          position: {
            x: mouseX - dragOffset.x,
            y: mouseY - dragOffset.y
          }
        };
      }
      return el;
    }));
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // If we're creating a relationship but clicked on the canvas, cancel the operation
    if (isCreatingRelationship && e.target === canvasRef.current) {
      setIsCreatingRelationship(false);
      setRelationshipSource(null);
      setTempEndPoint(null);
      return;
    }
    
    // Deselect when clicking on the canvas background
    if (e.target === canvasRef.current) {
      setSelectedElement(null);
      setSelectedRelationship(null);
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const handleCanvasMouseLeave = () => {
    setIsDragging(false);
  };

  // Prevent default behavior for drag over to allow drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  // Start creating a relationship from an element
  const startRelationship = (elementId: string, type: RelationshipType) => {
    setIsCreatingRelationship(true);
    setRelationshipSource(elementId);
    setRelationshipType(type);
  };
  
  // Create a relationship between two elements
  const createRelationship = (sourceId: string, targetId: string) => {
    const sourceElement = elements.find(el => el.id === sourceId);
    const targetElement = elements.find(el => el.id === targetId);
    
    if (!sourceElement || !targetElement) return;
    
    const newRelationship: Relationship = {
      id: uuidv4(),
      type: relationshipType,
      sourceId,
      targetId,
      points: [
        calculateConnectionPoint(sourceElement, targetElement),
        calculateConnectionPoint(targetElement, sourceElement)
      ]
    };
    
    setRelationships([...relationships, newRelationship]);
    
    toast({
      title: "Relationship created",
      description: `Created new ${relationshipType} relationship`,
    });
  };
  
  // Handle element context menu for relationship creation
  const handleElementContextMenu = (e: React.MouseEvent, element: Element) => {
    e.preventDefault();
    startRelationship(element.id, "Dependency");
  };

  // Handle relationship click
  const handleRelationshipClick = (e: React.MouseEvent, relationship: Relationship) => {
    e.stopPropagation();
    setSelectedElement(null);
    setSelectedRelationship(relationship);
  };

  return (
    <div
      ref={canvasRef}
      className="canvas-wrapper w-full h-full overflow-auto relative"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onMouseLeave={handleCanvasMouseLeave}
      onClick={handleCanvasClick}
    >
      <RelationshipRenderer
        relationships={relationships}
        elements={elements}
        tempRelationship={{
          sourceId: relationshipSource,
          tempEndPoint,
          type: relationshipType
        }}
        selectedRelationship={selectedRelationship}
        onRelationshipClick={handleRelationshipClick}
      />
      
      <ElementRenderer
        elements={elements}
        selectedElement={selectedElement}
        onElementMouseDown={handleElementMouseDown}
        onElementContextMenu={handleElementContextMenu}
      />
    </div>
  );
};

export default ModelingCanvas;
