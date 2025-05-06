
import { Element, Position } from "../model/types";

/**
 * Calculate connection points between two elements
 */
export const calculateConnectionPoints = (
  source: Element, 
  target: Element, 
  waypoints?: Position[]
): { source: Position; target: Position } => {
  // Extract positions and sizes
  const sourceCenter = {
    x: source.position.x + source.size.width / 2,
    y: source.position.y + source.size.height / 2
  };
  
  const targetCenter = {
    x: target.position.x + target.size.width / 2,
    y: target.position.y + target.size.height / 2
  };
  
  let sourceConnectionPoint: Position;
  let targetConnectionPoint: Position;
  
  if (waypoints && waypoints.length > 0) {
    // If waypoints exist, connect source to first waypoint and target to last waypoint
    sourceConnectionPoint = calculateIntersectionPoint(
      source, 
      waypoints[0]
    );
    
    targetConnectionPoint = calculateIntersectionPoint(
      target, 
      waypoints[waypoints.length - 1]
    );
  } else {
    // Direct connection between source and target
    sourceConnectionPoint = calculateIntersectionPoint(
      source, 
      targetCenter
    );
    
    targetConnectionPoint = calculateIntersectionPoint(
      target, 
      sourceCenter
    );
  }
  
  return {
    source: sourceConnectionPoint,
    target: targetConnectionPoint
  };
};

/**
 * Calculate intersection point of a line from center to target with element border
 */
export const calculateIntersectionPoint = (element: Element, targetPoint: Position): Position => {
  const center = {
    x: element.position.x + element.size.width / 2,
    y: element.position.y + element.size.height / 2
  };
  
  // Element bounds
  const left = element.position.x;
  const right = element.position.x + element.size.width;
  const top = element.position.y;
  const bottom = element.position.y + element.size.height;
  
  // Direction vector from center to target
  const dx = targetPoint.x - center.x;
  const dy = targetPoint.y - center.y;
  
  // Normalized vector (for direction only)
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length === 0) return center; // Same point, avoid division by zero
  
  const ndx = dx / length;
  const ndy = dy / length;
  
  // Calculate intersection with element border
  let t: number;
  
  // Check intersection with vertical borders (left and right)
  if (ndx > 0) {
    // Right border
    t = (right - center.x) / ndx;
  } else if (ndx < 0) {
    // Left border
    t = (left - center.x) / ndx;
  } else {
    // Vertical line, no intersection with left or right borders
    t = Number.MAX_VALUE;
  }
  
  // Check intersection with horizontal borders (top and bottom)
  let t2: number;
  if (ndy > 0) {
    // Bottom border
    t2 = (bottom - center.y) / ndy;
  } else if (ndy < 0) {
    // Top border
    t2 = (top - center.y) / ndy;
  } else {
    // Horizontal line, no intersection with top or bottom borders
    t2 = Number.MAX_VALUE;
  }
  
  // Use the smallest non-negative t
  if (t2 >= 0 && t2 < t) {
    t = t2;
  }
  
  // Calculate intersection point
  return {
    x: center.x + ndx * t,
    y: center.y + ndy * t
  };
};

/**
 * Convert a path string to a series of points
 */
export const pathToPoints = (path: string): Position[] => {
  if (!path) return [];
  
  // Match all coordinate pairs in the path
  const matches = path.match(/[ML]\s*(\d+(?:\.\d+)?)\s*,?\s*(\d+(?:\.\d+)?)/g);
  if (!matches) return [];
  
  return matches.map(match => {
    const [_, x, y] = match.match(/[ML]\s*(\d+(?:\.\d+)?)\s*,?\s*(\d+(?:\.\d+)?)/) || [];
    return { x: parseFloat(x), y: parseFloat(y) };
  });
};

/**
 * Calculate the closest point on an element to a given position
 */
export const calculateClosestPoint = (element: Element, point: Position): Position => {
  // Element bounds
  const left = element.position.x;
  const right = element.position.x + element.size.width;
  const top = element.position.y;
  const bottom = element.position.y + element.size.height;
  
  // Clamp point to element border
  const x = Math.max(left, Math.min(point.x, right));
  const y = Math.max(top, Math.min(point.y, bottom));
  
  // If point is inside the element, find closest border
  if (x > left && x < right && y > top && y < bottom) {
    // Distances to each border
    const dLeft = x - left;
    const dRight = right - x;
    const dTop = y - top;
    const dBottom = bottom - y;
    
    // Find minimum distance
    const min = Math.min(dLeft, dRight, dTop, dBottom);
    
    // Return point on closest border
    if (min === dLeft) return { x: left, y };
    if (min === dRight) return { x: right, y };
    if (min === dTop) return { x, y: top };
    return { x, y: bottom };
  }
  
  // Point is already on the border
  return { x, y };
};
