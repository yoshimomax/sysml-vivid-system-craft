
// SysML v2 Basic Types

export type ElementType = 
  | 'Block' 
  | 'Requirement' 
  | 'Activity' 
  | 'State' 
  | 'UseCase'
  | 'Package'
  | 'Port'
  | 'Interface';

export type RelationshipType = 
  | 'Dependency' 
  | 'Composition' 
  | 'Aggregation' 
  | 'Inheritance'
  | 'Association'
  | 'Satisfy'
  | 'Verify';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Element {
  id: string;
  type: ElementType;
  name: string;
  description?: string;
  position: Position;
  size: Size;
  properties?: Record<string, string>;
  stereotype?: string;
}

export interface Relationship {
  id: string;
  type: RelationshipType;
  sourceId: string;
  targetId: string;
  name?: string;
  points?: Position[];
}

export interface Diagram {
  id: string;
  name: string;
  description?: string;
  type: 'Structure' | 'Behavior' | 'Requirement';
  elements: Element[];
  relationships: Relationship[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  diagrams: Diagram[];
}
