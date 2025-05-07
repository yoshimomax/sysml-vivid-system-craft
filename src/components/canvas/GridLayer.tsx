
import React from "react";

interface GridLayerProps {
  className?: string;
}

export const GridLayer: React.FC<GridLayerProps> = ({ className }) => {
  return (
    <div 
      className={`grid-layer absolute inset-0 ${className || ''}`}
      style={{
        backgroundColor: 'var(--canvas-bg, hsl(0, 0%, 100%))'
        // グリッドパターンを完全に削除
      }}
    />
  );
};
