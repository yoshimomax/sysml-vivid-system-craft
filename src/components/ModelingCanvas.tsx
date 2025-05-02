
import { useState, useEffect, useRef } from "react";
import { Element, Position, ElementType, Size, Relationship } from "@/types/sysml";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/components/ui/use-toast";

interface ModelingCanvasProps {
  elements: Element[];
  setElements: React.Dispatch<React.SetStateAction<Element[]>>;
  relationships: Relationship[];
  setRelationships: React.Dispatch<React.SetStateAction<Relationship[]>>;
  selectedElement: Element | null;
  setSelectedElement: React.Dispatch<React.SetStateAction<Element | null>>;
}

const ModelingCanvas = ({
  elements,
  setElements,
  relationships,
  setRelationships,
  selectedElement,
  setSelectedElement
}: ModelingCanvasProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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
      case "Block":
        return { width: 180, height: 120 };
      case "Requirement":
        return { width: 200, height: 100 };
      case "Package":
        return { width: 220, height: 160 };
      case "Activity":
      case "State":
      case "UseCase":
        return { width: 160, height: 100 };
      default:
        return { width: 160, height: 80 };
    }
  };

  const handleElementMouseDown = (e: React.MouseEvent, element: Element) => {
    e.stopPropagation();
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
    // Deselect when clicking on the canvas background
    if (e.target === canvasRef.current) {
      setSelectedElement(null);
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
        onMouseDown={(e) => handleElementMouseDown(e, element)}
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
    // This will be expanded in future iterations
    return null;
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
