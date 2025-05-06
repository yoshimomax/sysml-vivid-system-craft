
import React from "react";

interface SelectionBoxProps {
  isSelecting: boolean;
  selectionBox: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null;
  scale: number;  // Added scale prop
}

export const SelectionBox: React.FC<SelectionBoxProps> = ({ isSelecting, selectionBox, scale }) => {
  if (!isSelecting || !selectionBox) return null;

  // Calculate dimensions in screen coordinates (no scaling needed)
  const left = Math.min(selectionBox.startX, selectionBox.endX);
  const top = Math.min(selectionBox.startY, selectionBox.endY);
  const width = Math.abs(selectionBox.endX - selectionBox.startX);
  const height = Math.abs(selectionBox.endY - selectionBox.startY);

  console.log("Rendering selection box:", { left, top, width, height, scale });

  // Apply the selection box directly to the screen (no need for transform)
  return (
    <div 
      className="absolute border-2 border-blue-500 bg-blue-500/10 pointer-events-none z-50"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
    />
  );
};
