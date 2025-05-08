
import React, { useEffect, useRef, useState } from "react";
import { Position, RelationshipType } from "../../model/types";
import { RelationshipCreator } from "./RelationshipCreator";

interface ContextMenuManagerProps {
  contextMenuPosition: Position | null;
  elementForContextMenu: string | null;
  onSelectRelationshipType: (type: RelationshipType) => void;
  onCancel: () => void;
}

export const ContextMenuManager: React.FC<ContextMenuManagerProps> = ({
  contextMenuPosition,
  elementForContextMenu,
  onSelectRelationshipType,
  onCancel
}) => {
  if (!contextMenuPosition || !elementForContextMenu) return null;
  
  // Prevent wheel events from propagating to canvas
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
  };
  
  // Use a ref to get the actual dimensions of the menu for better positioning
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuSize, setMenuSize] = useState({ width: 200, height: 150 }); // Default estimates
  
  // Measure the actual menu size after it's rendered
  useEffect(() => {
    if (menuRef.current) {
      const { width, height } = menuRef.current.getBoundingClientRect();
      setMenuSize({ width, height });
    }
  }, [contextMenuPosition]); // Re-measure when position changes
  
  // Position menu directly at cursor position with viewport boundary detection
  const adjustPosition = (pos: Position): Position => {
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Start with exact cursor position
    let adjustedX = pos.x;
    let adjustedY = pos.y;
    
    // Check right edge - if menu would go off screen, flip it to the left of cursor
    if (pos.x + menuSize.width > viewportWidth) {
      adjustedX = Math.max(0, pos.x - menuSize.width);
    }
    
    // Check bottom edge - if menu would go off screen, flip it above cursor
    if (pos.y + menuSize.height > viewportHeight) {
      adjustedY = Math.max(0, pos.y - menuSize.height);
    }
    
    return { x: adjustedX, y: adjustedY };
  };
  
  // Adjust position based on viewport constraints
  const adjustedPosition = adjustPosition(contextMenuPosition);
  
  return (
    <div 
      ref={menuRef}
      className="fixed z-50 pointer-events-auto relationship-context-menu" 
      style={{ 
        left: `${adjustedPosition.x}px`, 
        top: `${adjustedPosition.y}px`,
        position: 'fixed' // Ensure it's positioned relative to viewport
      }}
      onWheel={handleWheel}
    >
      <RelationshipCreator
        visible={true}
        position={contextMenuPosition}
        onSelectType={onSelectRelationshipType}
        onCancel={onCancel}
      />
    </div>
  );
};
