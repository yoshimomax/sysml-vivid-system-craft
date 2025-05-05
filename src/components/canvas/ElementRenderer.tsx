
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
      className={`element-block absolute ${isSelected ? 'element-selected' : ''}`}
      style={{
        left: `${element.position.x}px`,
        top: `${element.position.y}px`,
        width: `${element.size.width}px`,
        height: `${element.size.height}px`,
        zIndex: isSelected ? 20 : 10,
      }}
      data-element-id={element.id}
      data-element-type={element.type}
      onMouseDown={onMouseDown}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu(e);
      }}
    >
      <div className="header">
        {element.stereotype && <div className="text-xs text-muted-foreground">{`<<${element.stereotype}>>`}</div>}
        <div className="font-medium">{element.type}: {element.name}</div>
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
