
import { Diagram, Element, Project, Relationship } from '../../model/types';

// Project management state and actions
export interface ProjectState {
  project: Project;
  activeDiagramId: string;
  
  // Getters
  getActiveDiagram: () => Diagram | undefined;
  
  // Actions
  selectDiagram: (id: string) => void;
  addDiagram: (name: string, type: Diagram['type']) => void;
  removeDiagram: (id: string) => void;
}

// Element state and actions
export interface ElementState {
  // Actions
  addElement: (element: Element) => void;
  updateElement: (id: string, updates: Partial<Element>) => void;
  removeElement: (id: string) => void;
}

// Relationship state and actions
export interface RelationshipState {
  isCreatingRelationship: boolean;
  relationshipSourceId: string | null;
  relationshipType: string | null;
  
  // Actions
  addRelationship: (relationship: Relationship) => void;
  updateRelationship: (id: string, updates: Partial<Relationship>) => void;
  removeRelationship: (id: string) => void;
  
  // Relationship creation
  startCreatingRelationship: (sourceId: string, type: string) => void;
  cancelCreatingRelationship: () => void;
  completeRelationship: (targetId: string) => void;
}

// Selection state and actions
export interface SelectionState {
  selectedElementId: string | null;
  selectedElementIds: string[];
  selectedRelationshipId: string | null;
  
  // Getters
  getSelectedElement: () => Element | null;
  getSelectedElements: () => Element[];
  getSelectedRelationship: () => Relationship | null;
  
  // Actions
  selectElement: (id: string | null) => void;
  selectMultipleElements: (ids: string[]) => void;
  selectRelationship: (id: string | null) => void;
}

// UI state and actions
export interface UIState {
  isDragging: boolean;
  scale: number;
  
  // Actions
  startDragging: () => void;
  stopDragging: () => void;
  setScale: (scale: number) => void;
}

// Combined state type
export type ModelingState = ProjectState & ElementState & RelationshipState & SelectionState & UIState;
