
import React from "react";

interface GridLayerProps {
  className?: string;
}

export const GridLayer: React.FC<GridLayerProps> = ({ className }) => {
  return (
    <div 
      className={`absolute inset-0 grid-layer ${className || ''}`}
      style={{
        backgroundImage: `
          linear-gradient(to right, var(--grid-color) 1px, transparent 1px),
          linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
        backgroundColor: 'var(--canvas-bg)',
        '--grid-color': 'hsl(var(--canvas-grid))',
        '--canvas-bg': 'hsl(var(--canvas-bg))'
      } as React.CSSProperties}
    />
  );
};
