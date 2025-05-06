
import React from "react";

interface GridLayerProps {
  className?: string;
}

export const GridLayer: React.FC<GridLayerProps> = ({ className }) => {
  return (
    <div 
      className={`absolute inset-0 ${className || ''}`}
      style={{
        backgroundColor: 'var(--canvas-bg)',
        '--canvas-bg': 'hsl(var(--canvas-bg))'
      } as React.CSSProperties}
    />
  );
};
