
import React from "react";

interface SelectionBoxProps {
  isSelecting: boolean;
  selectionBox: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null;
}

export const SelectionBox: React.FC<SelectionBoxProps> = ({ isSelecting, selectionBox }) => {
  if (!isSelecting || !selectionBox) return null;

  return (
    <div 
      className="absolute border-2 border-blue-500 bg-blue-500/10"
      style={{
        left: Math.min(selectionBox.startX, selectionBox.endX),
        top: Math.min(selectionBox.startY, selectionBox.endY),
        width: Math.abs(selectionBox.endX - selectionBox.startX),
        height: Math.abs(selectionBox.endY - selectionBox.startY),
        zIndex: 1000,
        pointerEvents: 'none'
      }}
    />
  );
};
