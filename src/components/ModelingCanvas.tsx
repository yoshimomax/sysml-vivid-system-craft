import { useState, useEffect, useRef } from "react";
import { Element, Position, ElementType, Size, Relationship, RelationshipType } from "@/types/sysml";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/components/ui/use-toast";
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
  
  const getDefaultSizeForType = (type: ElementType): Size => {
    switch (type) {
      case "Part":
        return { width: 180, height: 120 };
      case "Requirement":
        return { width: 200, height: 100 };
      case "Package":
        return { width: 220, height: 160 };
      case "Action":
      case "State":
        return { width: 160, height: 100 };
      case "Class":
      case "Feature":
        return { width: 180, height: 120 };
      case "PortDefinition":
        return { width: 140, height: 80 };
      case "InterfaceDefinition":
        return { width: 160, height: 100 };
      default:
        return { width: 160, height: 80 };
    }
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
  
  // Calculate the connection point on an element's border
  const calculateConnectionPoint = (source: Element, target: Element): Position => {
    // Simple implementation - just use center points for now
    const sourceCenter = {
      x: source.position.x + source.size.width / 2,
      y: source.position.y + source.size.height / 2
    };
    
    return sourceCenter;
  };
  
  // Handle element context menu for relationship creation
  const handleElementContextMenu = (e: React.MouseEvent, element: Element) => {
    e.preventDefault();
    startRelationship(element.id, "Dependency");
  };

  // Get the path for drawing a relationship line
  const getRelationshipPath = (relationship: Relationship, elements: Element[]): string => {
    const source = elements.find(el => el.id === relationship.sourceId);
    const target = elements.find(el => el.id === relationship.targetId);
    
    if (!source || !target) return "";
    
    // Calculate source and target centers
    const sourceCenter = {
      x: source.position.x + source.size.width / 2,
      y: source.position.y + source.size.height / 2
    };
    
    const targetCenter = {
      x: target.position.x + target.size.width / 2,
      y: target.position.y + target.size.height / 2
    };
    
    // For now, just draw a straight line between centers
    return `M ${sourceCenter.x} ${sourceCenter.y} L ${targetCenter.x} ${targetCenter.y}`;
  };
  
  // Get the marker end type based on relationship type
  const getMarkerEnd = (type: RelationshipType): string => {
    switch (type) {
      case "Specialization":
        return "url(#triangle)";
      case "Dependency":
        return "url(#arrow)";
      case "Containment":
        return "url(#diamond)";
      case "Reference":
        return "url(#arrow)";
      default:
        return "url(#arrow)";
    }
  };

  // Handle relationship click
  const handleRelationshipClick = (e: React.MouseEvent, relationship: Relationship) => {
    e.stopPropagation();
    setSelectedElement(null);
    setSelectedRelationship(relationship);
  };

  const renderElements = () => {
    return elements.map((element) => (
      <div
        key={element.id}
        className={`element-block absolute ${selectedElement?.id === element.id ? 'element-selected' : ''}`}
        style={{
          left: `${element.position.x}px`,
          top: `${element.position.y}px`,
          width: `${element.size.width}px`,
          height: `${element.size.height}px`,
        }}
        data-type={element.type}
        onMouseDown={(e) => handleElementMouseDown(e, element)}
        onContextMenu={(e) => handleElementContextMenu(e, element)}
      >
        <div className="header">
          {element.stereotype && <div className="text-xs text-muted-foreground">{`<<${element.stereotype}>>`}</div>}
          {element.type}: {element.name}
        </div>
        <div className="content">
          {element.description || "No description"}
        </div>
        
        {/* Connection handles */}
        {selectedElement?.id === element.id && (
          <>
            <div className="element-handle n" />
            <div className="element-handle e" />
            <div className="element-handle s" />
            <div className="element-handle w" />
          </>
        )}
      </div>
    ));
  };

  const renderRelationships = () => {
    return (
      <>
        {/* SVG marker definitions */}
        <defs>
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
        </defs>
        
        {/* Actual relationships */}
        {relationships.map(relationship => (
          <path
            key={relationship.id}
            d={getRelationshipPath(relationship, elements)}
            className={`relationship-path ${selectedRelationship?.id === relationship.id ? 'relationship-path-selected' : ''}`}
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            markerEnd={getMarkerEnd(relationship.type)}
            onClick={(e) => handleRelationshipClick(e, relationship)}
          />
        ))}
        
        {/* Temporary line for relationship creation */}
        {isCreatingRelationship && relationshipSource && tempEndPoint && (
          <path
            className="relationship-path-temp"
            d={`M ${getElementCenter(relationshipSource).x} ${getElementCenter(relationshipSource).y} L ${tempEndPoint.x} ${tempEndPoint.y}`}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="5,5"
            fill="none"
            markerEnd={getMarkerEnd(relationshipType)}
          />
        )}
      </>
    );
  };
  
  // Helper to get element center
  const getElementCenter = (elementId: string): Position => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return { x: 0, y: 0 };
    
    return {
      x: element.position.x + element.size.width / 2,
      y: element.position.y + element.size.height / 2
    };
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
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {renderRelationships()}
      </svg>
      {renderElements()}
    </div>
  );
};

export default ModelingCanvas;
