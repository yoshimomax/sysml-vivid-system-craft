
import React from "react";
import { Element } from "../../model/types";

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
  return (
    <div
      className={`absolute pointer-events-auto element-block ${isSelected ? 'element-selected' : ''}`}
      style={{
        left: `${element.position.x}px`,
        top: `${element.position.y}px`,
        width: `${element.size.width}px`,
        height: `${element.size.height}px`,
        zIndex: isSelected ? 10 : 1
      }}
      data-element-id={element.id}
      data-type={element.type}
      onMouseDown={onMouseDown}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu(e);
      }}
    >
      <div className="header">
        {element.stereotype && <div className="text-xs text-muted-foreground">{`<<${element.stereotype}>>`}</div>}
        {element.type}: {element.name}
      </div>
      <div className="content">
        {element.description || "No description"}
      </div>
      
      {/* Connection handles */}
      {isSelected && (
        <>
          <div className="element-handle n" />
          <div className="element-handle e" />
          <div className="element-handle s" />
          <div className="element-handle w" />
        </>
      )}
    </div>
  );
};
