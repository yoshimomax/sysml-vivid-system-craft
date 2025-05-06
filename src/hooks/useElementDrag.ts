
import { useState, useCallback } from "react";
import { Position } from "../model/types";
import { diagramEngine } from "../core/DiagramEngine";
import { useModelingStore } from "../store";

export const useElementDrag = () => {
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const isDragging = useModelingStore(state => state.isDragging);
  const startDragging = useModelingStore(state => state.startDragging);
  const stopDragging = useModelingStore(state => state.stopDragging);
  const selectedElement = useModelingStore(state => state.getSelectedElement());
  const selectedElementIds = useModelingStore(state => state.selectedElementIds);
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
    
    // Check if we're clicking on an already selected element in a multi-selection
    const currentSelectedIds = useModelingStore.getState().selectedElementIds;
    if (currentSelectedIds.length > 1 && currentSelectedIds.includes(elementId)) {
      // Don't change selection, just start dragging
      console.log("Dragging within multi-selection");
    } else {
      // Use direct store method to set selection to this element
      diagramEngine.selectElement(elementId);
    }
    
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
    
    // Get the current scale from the store
    const scale = useModelingStore.getState().scale;
    
    // Check if we need to move multiple elements
    if (selectedElementIds.length > 1) {
      selectedElementIds.forEach(id => {
        const element = useModelingStore.getState().getActiveDiagram()?.elements.find(e => e.id === id);
        if (element) {
          // Calculate relative movement
          const deltaX = (newPosition.x - selectedElement.position.x);
          const deltaY = (newPosition.y - selectedElement.position.y);
          
          // Apply movement to this element
          updateElement(id, { 
            position: {
              x: element.position.x + deltaX,
              y: element.position.y + deltaY
            }
          });
        }
      });
    } else {
      // Only move the selected element
      updateElement(selectedElement.id, { position: newPosition });
    }
  }, [isDragging, selectedElement, dragOffset, updateElement, selectedElementIds]);
  
  /**
   * Handle drag end
   */
  const handleDragEnd = useCallback(() => {
    if (isDragging) {
      stopDragging();
      // Don't clear the selection here - we want selection to persist after drag
    }
  }, [isDragging, stopDragging]);
  
  return {
    isDragging,
    handleDragStart,
    handleDrag,
    handleDragEnd
  };
};
