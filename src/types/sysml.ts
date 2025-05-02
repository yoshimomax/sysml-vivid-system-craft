
// KerML and SysML v2 Core Types

// Common Types
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

// KerML Base Types (Foundation)
export type KerMLElementType = 
  | 'Element'          // Base abstract element
  | 'Feature'          // Basic feature
  | 'Type'             // Type definition
  | 'Classifier'       // Classifier (abstract)
  | 'Class'            // Class definition
  | 'DataType'         // DataType definition
  | 'Association'      // Association
  | 'Connector'        // Connection between features
  | 'Relationship'     // Basic relationship
  | 'Specialization'   // Type specialization
  | 'Redefinition'     // Feature redefinition
  | 'Subsetting'       // Feature subsetting
  | 'Conjugation'      // Type conjugation
  | 'FeatureTyping';   // Feature typing

// SysML v2 Element Types (Built on KerML)
export type SysMLElementType = 
  | 'Part'             // Structural aspect of a system
  | 'PortDefinition'   // Port definition
  | 'PortUsage'        // Usage of port
  | 'InterfaceDefinition' // Interface definition
  | 'ItemFlow'         // Flow of items
  | 'Action'           // Behavioral action
  | 'State'            // State in a state machine
  | 'Requirement'      // System requirement
  | 'ViewDefinition'   // Definition of a view
  | 'ViewUsage'        // Usage of a view
  | 'ViewpointDefinition' // Definition of a viewpoint
  | 'Package';         // Package container

// Combined type for all element types
export type ElementType = KerMLElementType | SysMLElementType;

// Relationship types
export type RelationshipType = 
  | 'Specialization'   // Type is a specialization of another type (inheritance)
  | 'Dependency'       // Element depends on another
  | 'Containment'      // Element contains another
  | 'Reference'        // Element references another
  | 'Subsetting'       // Feature subsets another feature
  | 'Redefinition'     // Feature redefines another feature
  | 'Binding'          // Parameter binding
  | 'ItemFlowConnection' // Connection between item flows
  | 'Satisfy'          // Requirement satisfaction
  | 'Verify';          // Requirement verification

// Basic Element interface - common to all KerML and SysML elements
export interface Element {
  id: string;
  type: ElementType;
  name: string;
  description?: string;
  position: Position;
  size: Size;
  properties?: Record<string, string>; // For now keeping as simple properties
  stereotype?: string;                 // Keeping stereotype for UML-style visual notation
}

// Relationship interface
export interface Relationship {
  id: string;
  type: RelationshipType;
  sourceId: string;
  targetId: string;
  name?: string;
  points?: Position[];
}

// Diagram representation
export interface Diagram {
  id: string;
  name: string;
  description?: string;
  type: 'Structure' | 'Behavior' | 'Requirement' | 'Parametric'; // Added Parametric
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
