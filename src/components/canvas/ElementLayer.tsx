
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
  
  // Sort elements so selected ones are rendered on top
  const sortedElements = [...elements].sort((a, b) => {
    // Selected elements on top
    const aSelected = a.id === selectedElementId || selectedElementIds.includes(a.id);
    const bSelected = b.id === selectedElementId || selectedElementIds.includes(b.id);
    
    if (aSelected && !bSelected) return 1;
    if (!aSelected && bSelected) return -1;
    return 0;
  });
  
  if (sortedElements.length === 0) {
    return null;
  }
  
  return (
    <div className="absolute inset-0">
      {sortedElements.map(element => (
        <ElementRenderer
          key={element.id}
          element={element}
          isSelected={element.id === selectedElementId || selectedElementIds.includes(element.id)}
          onMouseDown={(e) => onElementMouseDown(e, element.id)}
          onContextMenu={(e) => {
            e.stopPropagation();
            onElementContextMenu(e, element.id);
          }}
        />
      ))}
    </div>
  );
};
