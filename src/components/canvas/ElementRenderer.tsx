
import React from "react";
import { Element } from "../../model/types";
import { ElementCompartments } from "./ElementCompartments";

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
  // Add styling based on element type
  const getElementClass = () => {
    const baseClass = `absolute element-block element-${element.type.toLowerCase()}`;
    return `${baseClass} ${isSelected ? 'element-selected' : ''}`;
  };

  return (
    <div
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
    >
      {/* Element header with stereotype and name */}
      <div className="header">
        {element.stereotype && <div className="text-xs text-muted-foreground">{`<<${element.stereotype}>>`}</div>}
        <div className="element-title">{element.type}: {element.name}</div>
      </div>
      
      {/* Element compartments */}
      <ElementCompartments element={element} />
      
      {/* Connection handles */}
      {isSelected && (
        <>
          <div className="element-handle n" data-handle="n" />
          <div className="element-handle e" data-handle="e" />
          <div className="element-handle s" data-handle="s" />
          <div className="element-handle w" data-handle="w" />
          {/* Add diagonal handles for more connection points */}
          <div className="element-handle ne" data-handle="ne" />
          <div className="element-handle se" data-handle="se" />
          <div className="element-handle sw" data-handle="sw" />
          <div className="element-handle nw" data-handle="nw" />
        </>
      )}
    </div>
  );
};
