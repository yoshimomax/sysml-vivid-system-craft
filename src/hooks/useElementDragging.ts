
import { useState } from "react";
import { Element, Position } from "@/types/sysml";

interface UseElementDraggingProps {
  elements: Element[];
  setElements: (elements: Element[]) => void;
}

export const useElementDragging = ({
  elements,
  setElements,
}: UseElementDraggingProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });

  const startDragging = (e: React.MouseEvent, element: Element, canvasRef: React.RefObject<HTMLDivElement>) => {
    setIsDragging(true);
    
    // Calculate offset from element position to mouse position
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    const mouseX = e.clientX - canvasRect.left + (canvasRef.current?.scrollLeft || 0);
    const mouseY = e.clientY - canvasRect.top + (canvasRef.current?.scrollTop || 0);
    
    setDragOffset({
      x: mouseX - element.position.x,
      y: mouseY - element.position.y
    });
  };

  const handleDragging = (e: React.MouseEvent, selectedElementId: string | null, canvasRef: React.RefObject<HTMLDivElement>) => {
    if (!isDragging || !selectedElementId) return;
    
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    const mouseX = e.clientX - canvasRect.left + (canvasRef.current?.scrollLeft || 0);
    const mouseY = e.clientY - canvasRect.top + (canvasRef.current?.scrollTop || 0);
    
    // Ensure elements is an array
    const elementArray = Array.isArray(elements) ? elements : [];
    
    // Update element position
    const updatedElements = elementArray.map(el => {
      if (el.id === selectedElementId) {
        return {
          ...el,
          position: {
            x: mouseX - dragOffset.x,
            y: mouseY - dragOffset.y
          }
        };
      }
      return el;
    });
    
    setElements(updatedElements);
  };

  const stopDragging = () => {
    setIsDragging(false);
  };

  return {
    isDragging,
    startDragging,
    handleDragging,
    stopDragging
  };
};
