
import React from "react";
import { ElementType } from "../../model/types";
import { createDefaultElement } from "../../core/ElementFactory";
import { diagramEngine } from "../../core/DiagramEngine";
import { useToast } from "@/components/ui/use-toast";

interface DropLayerProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  children?: React.ReactNode;
}

export const DropLayer: React.FC<DropLayerProps> = ({ canvasRef, children }) => {
  const { toast } = useToast();
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const elementType = e.dataTransfer.getData("application/sysml-element") as ElementType;
    
    if (!elementType) {
      console.log("No element type found in drag data");
      return;
    }
    
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    // Get correct position relative to the canvas, accounting for scroll
    const x = e.clientX - canvasRect.left + (canvasRef.current?.scrollLeft || 0);
    const y = e.clientY - canvasRect.top + (canvasRef.current?.scrollTop || 0);
    
    // Create and add element
    const newElement = createDefaultElement(elementType, x, y);
    diagramEngine.createElement(elementType, { x, y }, newElement.size, `New ${elementType}`);
    
    toast({
      title: "Element added",
      description: `Added new ${elementType} element to the diagram`,
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Show allowed cursor
    e.dataTransfer.dropEffect = "copy";
  };
  
  return (
    <div
      className="w-full h-full"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {children}
    </div>
  );
};
