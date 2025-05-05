
import { Element, Position } from "../model/types";

/**
 * Calculate connection point between elements
 */
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
  
  // Source element bounds
  const sourceLeft = source.position.x;
  const sourceRight = source.position.x + source.size.width;
  const sourceTop = source.position.y;
  const sourceBottom = source.position.y + source.size.height;
  
  // Calculate intersection with source element border
  let sourceX = sourceCenter.x;
  let sourceY = sourceCenter.y;
  
  const slope = dy / dx; // Slope of the line between centers
  
  if (Math.abs(dx) > Math.abs(dy)) {
    // Line is more horizontal than vertical
    if (dx > 0) {
      // Target is to the right
      sourceX = sourceRight;
      sourceY = sourceCenter.y + slope * (sourceRight - sourceCenter.x);
    } else {
      // Target is to the left
      sourceX = sourceLeft;
      sourceY = sourceCenter.y + slope * (sourceLeft - sourceCenter.x);
    }
  } else {
    // Line is more vertical than horizontal
    if (dy > 0) {
      // Target is below
      sourceY = sourceBottom;
      sourceX = dx === 0 ? sourceCenter.x : sourceCenter.x + (sourceBottom - sourceCenter.y) / slope;
    } else {
      // Target is above
      sourceY = sourceTop;
      sourceX = dx === 0 ? sourceCenter.x : sourceCenter.x + (sourceTop - sourceCenter.y) / slope;
    }
  }
  
  return { x: sourceX, y: sourceY };
};

/**
 * Calculate connection points for both source and target
 */
export const calculateConnectionPoints = (source: Element, target: Element) => {
  return {
    source: calculateConnectionPoint(source, target),
    target: calculateConnectionPoint(target, source)
  };
};

/**
 * Get element center position
 */
export const getElementCenter = (element: Element): Position => {
  return {
    x: element.position.x + element.size.width / 2,
    y: element.position.y + element.size.height / 2
  };
};
