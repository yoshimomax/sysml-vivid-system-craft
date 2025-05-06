
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
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setElementForContextMenu(null);
  }, []);
  
  // Handle element context menu for relationship creation
  const handleElementContextMenu = useCallback((e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
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
