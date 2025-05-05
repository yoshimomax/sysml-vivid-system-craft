
import { ElementType, Size } from "../model/types";
import { v4 as uuidv4 } from "uuid";

/**
 * Get default size for an element type
 */
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

/**
 * Create a new element with default properties
 */
export const createDefaultElement = (type: ElementType, x: number, y: number) => {
  const size = getDefaultSizeForType(type);
  
  return {
    id: uuidv4(),
    type,
    name: `New ${type}`,
    position: { x, y },
    size,
    description: "",
    properties: getDefaultPropertiesForType(type),
  };
};

/**
 * Get default properties for an element type
 */
const getDefaultPropertiesForType = (type: ElementType): Record<string, any> => {
  switch (type) {
    case "Part":
      return {
        isAbstract: "false",
        multiplicity: "1",
        isPortion: "false"
      };
    case "Requirement":
      return {
        reqId: "",
        priority: "Medium"
      };
    case "State":
      return {
        isInitial: "false",
        isFinal: "false"
      };
    case "Action":
      return {
        duration: "",
        isStream: "false"
      };
    case "PortDefinition":
    case "PortUsage":
      return {
        isConjugated: "false",
        direction: "inout"
      };
    default:
      return {};
  }
};
