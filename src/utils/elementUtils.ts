
import { ElementType, Size } from "@/types/sysml";

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
export const calculateConnectionPoint = (source: any, target: any) => {
  // Simple implementation - just use center points for now
  const sourceCenter = {
    x: source.position.x + source.size.width / 2,
    y: source.position.y + source.size.height / 2
  };
  
  return sourceCenter;
};
