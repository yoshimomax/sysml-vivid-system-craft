
import React from "react";
import { v4 as uuidv4 } from 'uuid';
import { diagramEngine } from "../../core/diagram"; 
import { ElementType } from "../../model/types";

interface DropLayerProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
}

export const DropLayer: React.FC<DropLayerProps> = ({ canvasRef, children }) => {
  // Handle element drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    // これが修正点です: application/sysml-element キーを使用してデータを取得
    const elementType = e.dataTransfer.getData("application/sysml-element") as ElementType;
    
    if (!elementType) {
      console.error("No element type provided in drop event");
      return;
    }
    
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    // Calculate position relative to canvas, accounting for scroll
    const x = e.clientX - canvasRect.left + (canvasRef.current?.scrollLeft || 0);
    const y = e.clientY - canvasRect.top + (canvasRef.current?.scrollTop || 0);
    
    // Create the element at the drop position
    const position = { x, y };
    diagramEngine.createElement(elementType, position);
  };
  
  // Prevent default behavior to allow drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="h-full w-full"
    >
      {children}
    </div>
  );
};
