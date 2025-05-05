
import { Element, ElementType, Position, Size } from "@/types/sysml";

// Get default size for an element type
export const getDefaultSizeForType = (type: ElementType): Size => {
  switch (type) {
    case "Part":
      return { width: 180, height: 120 };
    case "Requirement":
      return { width: 200, height: 100 };
    case "Package":
      return { width: 220, height: 160 };
    case "Action":
    case "State":
      return { width: 160, height: 100 };
    case "Class":
    case "Feature":
      return { width: 180, height: 120 };
    case "PortDefinition":
      return { width: 140, height: 80 };
    case "InterfaceDefinition":
      return { width: 160, height: 100 };
    default:
      return { width: 160, height: 80 };
  }
};

// Calculate connection point between elements
export const calculateConnectionPoint = (source: Element, target: Element): Position => {
  // Get centers of both elements
  const sourceCenter = {
    x: source.position.x + source.size.width / 2,
    y: source.position.y + source.size.height / 2
  };
  
  const targetCenter = {
    x: target.position.x + target.size.width / 2,
    y: target.position.y + target.size.height / 2
  };
  
  // Calculate direction vector
  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;
  
  // Determine which edge of the source element to use
  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal connection (left or right edge)
    const x = dx > 0 ? source.position.x + source.size.width : source.position.x;
    const ratio = dx === 0 ? 0 : dy / dx;
    const y = sourceCenter.y + ratio * (x - sourceCenter.x);
    return { x, y };
  } else {
    // Vertical connection (top or bottom edge)
    const y = dy > 0 ? source.position.y + source.size.height : source.position.y;
    const ratio = dy === 0 ? 0 : dx / dy;
    const x = sourceCenter.x + ratio * (y - sourceCenter.y);
    return { x, y };
  }
};

// Calculate connection points for both source and target
export const calculateConnectionPoints = (source: Element, target: Element) => {
  return {
    source: calculateConnectionPoint(source, target),
    target: calculateConnectionPoint(target, source)
  };
};
