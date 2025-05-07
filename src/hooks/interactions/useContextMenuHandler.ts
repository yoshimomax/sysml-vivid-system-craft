
import { useCallback } from "react";

/**
 * Hook for handling context menu actions
 */
export const useContextMenuHandler = (
  elementForContextMenu: string | null,
  startRelationship: (elementId: string, type: string) => void,
  setContextMenuPosition: (position: any | null) => void,
  setElementForContextMenu: (elementId: string | null) => void
) => {
  // Handle relationship type selection
  const handleRelationshipTypeSelect = useCallback((type: string) => {
    if (elementForContextMenu) {
      startRelationship(elementForContextMenu, type);
    }
    setContextMenuPosition(null);
    setElementForContextMenu(null);
  }, [elementForContextMenu, startRelationship, setContextMenuPosition, setElementForContextMenu]);

  return {
    handleRelationshipTypeSelect
  };
};
