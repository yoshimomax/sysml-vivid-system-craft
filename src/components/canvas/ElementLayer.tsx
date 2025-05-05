
import React from "react";
import { Element } from "../../model/types";
import { ElementRenderer } from "./ElementRenderer";
import { useModelingStore } from "../../store/modelingStore";

interface ElementLayerProps {
  onElementMouseDown: (e: React.MouseEvent, elementId: string) => void;
  onElementContextMenu: (e: React.MouseEvent, elementId: string) => void;
}

export const ElementLayer: React.FC<ElementLayerProps> = ({
  onElementMouseDown,
  onElementContextMenu
}) => {
  // Get elements from store
  const activeDiagram = useModelingStore(state => state.getActiveDiagram());
  const elements = activeDiagram?.elements || [];
  const selectedElementId = useModelingStore(state => state.selectedElementId);
  const selectedElementIds = useModelingStore(state => state.selectedElementIds);
  
  if (elements.length === 0) {
    return null;
  }
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {elements.map(element => (
        <ElementRenderer
          key={element.id}
          element={element}
          isSelected={element.id === selectedElementId || selectedElementIds.includes(element.id)}
          onMouseDown={(e) => onElementMouseDown(e, element.id)}
          onContextMenu={(e) => onElementContextMenu(e, element.id)}
        />
      ))}
    </div>
  );
};
