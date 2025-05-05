
import { useState, useCallback } from "react";
import { Position } from "../model/types";
import { diagramEngine } from "../core/DiagramEngine";
import { useModelingStore } from "../store/modelingStore";

export const useElementDrag = () => {
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const isDragging = useModelingStore(state => state.isDragging);
  const startDragging = useModelingStore(state => state.startDragging);
  const stopDragging = useModelingStore(state => state.stopDragging);
  const selectedElement = useModelingStore(state => state.getSelectedElement());
  const updateElement = useModelingStore(state => state.updateElement);
  
  /**
   * Start dragging an element
   */
  const handleDragStart = useCallback((e: React.MouseEvent, elementId: string, canvasRef: React.RefObject<HTMLDivElement>) => {
    e.stopPropagation();
    
    // Check if we're already creating a relationship
    const isCreatingRelationship = useModelingStore.getState().isCreatingRelationship;
    if (isCreatingRelationship) {
      const completeRelationship = useModelingStore.getState().completeRelationship;
      completeRelationship(elementId);
      return;
    }
    
    // Use direct store method to avoid unnecessary re-renders
    diagramEngine.selectElement(elementId);
    
    // Calculate offset from mouse position to element top-left
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    const element = useModelingStore.getState().getSelectedElement();
    if (!element) return;
    
    const mouseX = e.clientX - canvasRect.left + (canvasRef.current?.scrollLeft || 0);
    const mouseY = e.clientY - canvasRect.top + (canvasRef.current?.scrollTop || 0);
    
    setDragOffset({
      x: mouseX - element.position.x,
      y: mouseY - element.position.y
    });
    
    startDragging();
  }, [startDragging]);
  
  /**
   * Handle element dragging
   */
  const handleDrag = useCallback((e: React.MouseEvent, canvasRef: React.RefObject<HTMLDivElement>) => {
    if (!isDragging || !selectedElement) return;
    
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    const mouseX = e.clientX - canvasRect.left + (canvasRef.current?.scrollLeft || 0);
    const mouseY = e.clientY - canvasRect.top + (canvasRef.current?.scrollTop || 0);
    
    const newPosition = {
      x: mouseX - dragOffset.x,
      y: mouseY - dragOffset.y
    };
    
    // Use direct store method to update element position
    updateElement(selectedElement.id, { position: newPosition });
  }, [isDragging, selectedElement, dragOffset, updateElement]);
  
  /**
   * Handle drag end
   */
  const handleDragEnd = useCallback(() => {
    if (isDragging) {
      stopDragging();
    }
  }, [isDragging, stopDragging]);
  
  return {
    isDragging,
    handleDragStart,
    handleDrag,
    handleDragEnd
  };
};
