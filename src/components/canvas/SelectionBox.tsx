
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

  const left = Math.min(selectionBox.startX, selectionBox.endX);
  const top = Math.min(selectionBox.startY, selectionBox.endY);
  const width = Math.abs(selectionBox.endX - selectionBox.startX);
  const height = Math.abs(selectionBox.endY - selectionBox.startY);

  return (
    <div 
      className="absolute border-2 border-blue-500 bg-blue-500/10 selection-box"
      style={{
        left,
        top,
        width,
        height
      }}
    />
  );
};
