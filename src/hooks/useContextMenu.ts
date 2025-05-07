
import { useState, useCallback } from "react";
import { Position } from "../model/types";

/**
 * Hook for managing context menu state and interactions
 */
export const useContextMenu = () => {
  const [contextMenuPosition, setContextMenuPosition] = useState<Position | null>(null);
  const [elementForContextMenu, setElementForContextMenu] = useState<string | null>(null);
  
  // Handle canvas context menu
  const handleCanvasContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    // Get the canvas-relative position
    const targetElement = e.currentTarget as HTMLElement;
    const rect = targetElement.getBoundingClientRect();
    const x = e.clientX - rect.left + (targetElement.scrollLeft || 0);
    const y = e.clientY - rect.top + (targetElement.scrollTop || 0);
    
    setContextMenuPosition({ x, y });
    setElementForContextMenu(null);
  }, []);
  
  // Handle element context menu for relationship creation
  const handleElementContextMenu = useCallback((e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get the canvas-relative position
    const canvasElement = (e.currentTarget as HTMLElement).closest('.canvas-wrapper') as HTMLElement;
    if (canvasElement) {
      const rect = canvasElement.getBoundingClientRect();
      const x = e.clientX - rect.left + (canvasElement.scrollLeft || 0);
      const y = e.clientY - rect.top + (canvasElement.scrollTop || 0);
      
      setContextMenuPosition({ x, y });
    } else {
      // Fallback if canvas wrapper not found
      setContextMenuPosition({ x: e.clientX, y: e.clientY });
    }
    
    setElementForContextMenu(elementId);
  }, []);
  
  return {
    contextMenuPosition,
    elementForContextMenu,
    setContextMenuPosition,
    setElementForContextMenu,
    handleCanvasContextMenu,
    handleElementContextMenu
  };
};
