
// SysML v2 Core Type Definitions

// Common Types
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

// Base Element Types
export interface BaseElement {
  id: string;
  name: string;
  description?: string;
}

// Visual Element in a Diagram
export interface DiagramElement extends BaseElement {
  position: Position;
  size: Size;
  stereotype?: string;
  properties?: Record<string, any>;
}

// KerML Base Types
export type KerMLElementType =
  | 'Element'
  | 'Feature'
  | 'Type'
  | 'Classifier'
  | 'Class'
  | 'DataType'
  | 'Association'
  | 'Connector'
  | 'Relationship'
  | 'Specialization'
  | 'Redefinition'
  | 'Subsetting'
  | 'Conjugation'
  | 'FeatureTyping';

// SysML v2 Element Types
export type SysMLElementType =
  | 'Part'
  | 'PortDefinition'
  | 'PortUsage'
  | 'InterfaceDefinition'
  | 'ItemFlow'
  | 'Action'
  | 'State'
  | 'Requirement'
  | 'ViewDefinition'
  | 'ViewUsage'
  | 'ViewpointDefinition'
  | 'Package'
  | 'ConstraintBlock'     // Added for parametric diagrams
  | 'ConstraintProperty'  // Added for parametric diagrams
  | 'ValueProperty';      // Added for parametric properties

// Combined element type
export type ElementType = KerMLElementType | SysMLElementType;

// Relationship types
export type RelationshipType =
  | 'Specialization'
  | 'Dependency'
  | 'Containment'
  | 'Reference'
  | 'Subsetting'
  | 'Redefinition'
  | 'Binding'
  | 'ItemFlowConnection'
  | 'Satisfy'        // Requirement satisfaction relationship
  | 'Verify'         // Requirement verification relationship
  | 'Allocate';      // Allocation relationship

// Modeling Element with type information
export interface Element extends DiagramElement {
  type: ElementType;
}

// Relationship between elements
export interface Relationship extends BaseElement {
  id: string;
  type: RelationshipType;
  sourceId: string;
  targetId: string;
  waypoints?: Position[];  // Added support for custom routing
  label?: string;          // Added support for relationship labels
  properties?: {
    lineStyle?: 'solid' | 'dashed' | 'dotted';
    lineColor?: string;
    lineWidth?: number;
  };
}

// Diagram representation
export interface Diagram {
  id: string;
  name: string;
  description?: string;
  type: 'Structure' | 'Behavior' | 'Requirement' | 'Parametric';
  elements: Element[];
  relationships: Relationship[];
}

// Project container
export interface Project {
  id: string;
  name: string;
  description?: string;
  diagrams: Diagram[];
}
