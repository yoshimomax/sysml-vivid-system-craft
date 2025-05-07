
import { useModelingStore } from "../../store/modelingStore";
import { Element } from "../../model/types";

/**
 * Align multiple elements
 */
function alignElements(elementIds: string[], direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') {
  const state = useModelingStore.getState();
  const elements = elementIds.map(id => state.getActiveDiagram()?.elements.find(e => e.id === id)).filter(Boolean) as Element[];
  
  if (elements.length <= 1) return;
  
  // Calculate bounds
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  
  elements.forEach(el => {
    minX = Math.min(minX, el.position.x);
    maxX = Math.max(maxX, el.position.x + el.size.width);
    minY = Math.min(minY, el.position.y);
    maxY = Math.max(maxY, el.position.y + el.size.height);
  });
  
  // Perform alignment
  elements.forEach(el => {
    const updates: Partial<Element> = { position: { ...el.position } };
    
    switch (direction) {
      case 'left':
        updates.position.x = minX;
        break;
      case 'center':
        updates.position.x = (minX + maxX) / 2 - el.size.width / 2;
        break;
      case 'right':
        updates.position.x = maxX - el.size.width;
        break;
      case 'top':
        updates.position.y = minY;
        break;
      case 'middle':
        updates.position.y = (minY + maxY) / 2 - el.size.height / 2;
        break;
      case 'bottom':
        updates.position.y = maxY - el.size.height;
        break;
    }
    
    state.updateElement(el.id, updates);
  });
}

export const alignmentOperations = {
  alignElements
};
