
import React, { useEffect, useRef } from "react";
import { Element } from "../../model/types";
import { ElementCompartments } from "./ElementCompartments";
import { useModelingStore } from "../../store";

interface ElementRendererProps {
  element: Element;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export const ElementRenderer: React.FC<ElementRendererProps> = ({
  element,
  isSelected,
  onMouseDown,
  onContextMenu
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const updateElementSize = useModelingStore(state => state.updateElementSize);
  
  // Update element size after it renders
  useEffect(() => {
    if (elementRef.current) {
      const { width, height } = elementRef.current.getBoundingClientRect();
      if (width > 0 && height > 0 && 
          (width !== element.size.width || height !== element.size.height)) {
        console.log(`Updating element ${element.id} size to ${width}x${height}`);
        updateElementSize(element.id, width, height);
      }
    }
  }, [element.id, element.size.width, element.size.height, updateElementSize]);

  // Add styling based on element type
  const getElementClass = () => {
    const baseClass = `absolute element-block element-${element.type.toLowerCase()}`;
    return `${baseClass} ${isSelected ? 'element-selected' : ''}`;
  };

  // Handle preventing propagation for element content scrolling
  const handleContentWheel = (e: React.WheelEvent) => {
    // Stop propagation to prevent canvas zoom when scrolling inside element
    e.stopPropagation();
  };

  return (
    <div
      ref={elementRef}
      className={getElementClass()}
      style={{
        left: `${element.position.x}px`,
        top: `${element.position.y}px`,
        width: `${element.size.width}px`,
        height: `${element.size.height}px`,
        zIndex: isSelected ? 10 : 1,
        pointerEvents: "auto"
      }}
      data-element-id={element.id}
      data-type={element.type}
      onMouseDown={(e) => {
        e.stopPropagation();
        onMouseDown(e);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu(e);
      }}
      onWheel={handleContentWheel}
    >
      {/* Element header with stereotype and name */}
      <div className="header">
        {element.stereotype && <div className="text-xs text-muted-foreground">{`<<${element.stereotype}>>`}</div>}
        <div className="element-title">{element.type}: {element.name}</div>
      </div>
      
      {/* Element compartments */}
      <ElementCompartments element={element} />
      
      {/* Resizing handles - only show when selected */}
      {isSelected && (
        <>
          <div className="element-handle n" data-handle="n" />
          <div className="element-handle e" data-handle="e" />
          <div className="element-handle s" data-handle="s" />
          <div className="element-handle w" data-handle="w" />
          {/* Add diagonal handles for more precise resizing */}
          <div className="element-handle ne" data-handle="ne" />
          <div className="element-handle se" data-handle="se" />
          <div className="element-handle sw" data-handle="sw" />
          <div className="element-handle nw" data-handle="nw" />
        </>
      )}
    </div>
  );
};
