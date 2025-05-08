
import React from "react";

interface SelectionBoxProps {
  isSelecting: boolean;
  selectionBox: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null;
  scale: number;
}

export const SelectionBox: React.FC<SelectionBoxProps> = ({ isSelecting, selectionBox, scale }) => {
  if (!isSelecting || !selectionBox) return null;

  // Calculate dimensions in screen coordinates (multiplied by scale for display)
  const left = Math.min(selectionBox.startX, selectionBox.endX) * scale;
  const top = Math.min(selectionBox.startY, selectionBox.endY) * scale;
  const width = Math.abs(selectionBox.endX - selectionBox.startX) * scale;
  const height = Math.abs(selectionBox.endY - selectionBox.startY) * scale;

  // Only render if the selection has some size
  if (width < 1 && height < 1) return null;

  return (
    <div 
      className="absolute border-2 border-blue-500 bg-blue-500/10 pointer-events-none z-50 select-none"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
        userSelect: 'none',
      }}
      data-testid="selection-box"
    />
  );
};
