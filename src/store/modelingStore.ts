
import { create } from 'zustand';
import { Diagram, Element, Project, Relationship } from '../model/types';
import { v4 as uuidv4 } from 'uuid';
import { eventBus, DiagramEvents as CoreDiagramEvents } from '../core/EventBus';

// Store state interface
interface ModelingState {
  // Data
  project: Project;
  activeDiagramId: string;
  selectedElementId: string | null;
  selectedElementIds: string[]; // New: Multiple selection support
  selectedRelationshipId: string | null;
  
  // UI State
  isCreatingRelationship: boolean;
  relationshipSourceId: string | null;
  relationshipType: string | null;
  isDragging: boolean;
  scale: number; // New: Zoom scale
  
  // Getters
  getActiveDiagram: () => Diagram | undefined;
  getSelectedElement: () => Element | null;
  getSelectedElements: () => Element[]; // New: Get multiple selected elements
  getSelectedRelationship: () => Relationship | null;
  
  // Actions
  selectDiagram: (id: string) => void;
  addDiagram: (name: string, type: Diagram['type']) => void;
  removeDiagram: (id: string) => void;
  
  selectElement: (id: string | null) => void;
  selectMultipleElements: (ids: string[]) => void; // New: Select multiple elements
  addElement: (element: Element) => void;
  updateElement: (id: string, updates: Partial<Element>) => void;
  removeElement: (id: string) => void;
  
  selectRelationship: (id: string | null) => void;
  addRelationship: (relationship: Relationship) => void;
  updateRelationship: (id: string, updates: Partial<Relationship>) => void;
  removeRelationship: (id: string) => void;
  
  startCreatingRelationship: (sourceId: string, type: string) => void;
  cancelCreatingRelationship: () => void;
  completeRelationship: (targetId: string) => void;
  
  startDragging: () => void;
  stopDragging: () => void;
  
  // Zoom actions
  setScale: (scale: number) => void; // New: Set zoom scale
}

// Create the store
export const useModelingStore = create<ModelingState>((set, get) => ({
  // Initial state
  project: {
    id: uuidv4(),
    name: 'New Project',
    diagrams: [
      {
        id: uuidv4(),
        name: 'Main Diagram',
        type: 'Structure',
        elements: [],
        relationships: []
      }
    ]
  },
  activeDiagramId: '',
  selectedElementId: null,
  selectedElementIds: [], // New: Initialize empty array
  selectedRelationshipId: null,
  isCreatingRelationship: false,
  relationshipSourceId: null,
  relationshipType: null,
  isDragging: false,
  scale: 1, // New: Initial scale is 1
  
  // Initialize with first diagram
  getActiveDiagram: () => {
    const { project, activeDiagramId } = get();
    return project.diagrams.find(d => d.id === activeDiagramId) || project.diagrams[0];
  },
  
  getSelectedElement: () => {
    const { selectedElementId, getActiveDiagram } = get();
    if (!selectedElementId) return null;
    
    const diagram = getActiveDiagram();
    return diagram?.elements.find(e => e.id === selectedElementId) || null;
  },
  
  // New: Get multiple selected elements
  getSelectedElements: () => {
    const { selectedElementIds, getActiveDiagram } = get();
    if (selectedElementIds.length === 0) return [];
    
    const diagram = getActiveDiagram();
    if (!diagram) return [];
    
    return diagram.elements.filter(e => selectedElementIds.includes(e.id));
  },
  
  getSelectedRelationship: () => {
    const { selectedRelationshipId, getActiveDiagram } = get();
    if (!selectedRelationshipId) return null;
    
    const diagram = getActiveDiagram();
    return diagram?.relationships.find(r => r.id === selectedRelationshipId) || null;
  },
  
  // Diagram actions
  selectDiagram: (id) => {
    set({ activeDiagramId: id, selectedElementId: null, selectedRelationshipId: null });
    eventBus.publish(CoreDiagramEvents.DIAGRAM_CHANGED, id);
  },
  
  addDiagram: (name, type) => {
    const newDiagram = {
      id: uuidv4(),
      name,
      type,
      elements: [],
      relationships: []
    };
    
    set(state => ({
      project: {
        ...state.project,
        diagrams: [...state.project.diagrams, newDiagram]
      },
      activeDiagramId: newDiagram.id
    }));
    
    eventBus.publish(CoreDiagramEvents.DIAGRAM_CHANGED, newDiagram.id);
  },
  
  removeDiagram: (id) => {
    const { project, activeDiagramId } = get();
    
    // Don't remove the last diagram
    if (project.diagrams.length <= 1) {
      return;
    }
    
    const updatedDiagrams = project.diagrams.filter(d => d.id !== id);
    const newActiveId = id === activeDiagramId ? updatedDiagrams[0].id : activeDiagramId;
    
    set(state => ({
      project: {
        ...state.project,
        diagrams: updatedDiagrams
      },
      activeDiagramId: newActiveId,
      selectedElementId: null,
      selectedRelationshipId: null
    }));
    
    eventBus.publish(CoreDiagramEvents.DIAGRAM_CHANGED, newActiveId);
  },
  
  // Element actions
  selectElement: (id) => {
    set({ 
      selectedElementId: id, 
      selectedElementIds: id ? [id] : [], // Update the array too
      selectedRelationshipId: null 
    });
    eventBus.publish(CoreDiagramEvents.ELEMENT_SELECTED, id);
  },
  
  selectMultipleElements: (ids) => {
    set({ 
      selectedElementIds: ids,
      selectedElementId: ids.length === 1 ? ids[0] : null,
      selectedRelationshipId: null
    });
    eventBus.publish(DiagramEventsExtended.MULTIPLE_ELEMENTS_SELECTED, ids);
  },
  
  addElement: (element) => {
    const diagram = get().getActiveDiagram();
    if (!diagram) return;
    
    set(state => {
      const updatedDiagrams = state.project.diagrams.map(d => {
        if (d.id === diagram.id) {
          return {
            ...d,
            elements: [...d.elements, element]
          };
        }
        return d;
      });
      
      return {
        project: {
          ...state.project,
          diagrams: updatedDiagrams
        },
        selectedElementId: element.id,
        selectedElementIds: [element.id],
        selectedRelationshipId: null
      };
    });
    
    eventBus.publish(CoreDiagramEvents.ELEMENT_ADDED, element);
  },
  
  updateElement: (id, updates) => {
    const diagram = get().getActiveDiagram();
    if (!diagram) return;
    
    set(state => {
      const updatedDiagrams = state.project.diagrams.map(d => {
        if (d.id === diagram.id) {
          return {
            ...d,
            elements: d.elements.map(el => {
              if (el.id === id) {
                const updatedElement = { ...el, ...updates };
                eventBus.publish(CoreDiagramEvents.ELEMENT_UPDATED, updatedElement);
                return updatedElement;
              }
              return el;
            })
          };
        }
        return d;
      });
      
      return {
        project: {
          ...state.project,
          diagrams: updatedDiagrams
        }
      };
    });
  },
  
  removeElement: (id) => {
    const diagram = get().getActiveDiagram();
    if (!diagram) return;
    
    set(state => {
      // Also remove any relationships connected to this element
      const elementRelationships = diagram.relationships.filter(
        r => r.sourceId === id || r.targetId === id
      );
      
      const updatedDiagrams = state.project.diagrams.map(d => {
        if (d.id === diagram.id) {
          return {
            ...d,
            elements: d.elements.filter(el => el.id !== id),
            relationships: d.relationships.filter(
              r => r.sourceId !== id && r.targetId !== id
            )
          };
        }
        return d;
      });
      
      return {
        project: {
          ...state.project,
          diagrams: updatedDiagrams
        },
        selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
        selectedElementIds: state.selectedElementIds.includes(id) 
          ? state.selectedElementIds.filter(elId => elId !== id) 
          : state.selectedElementIds
      };
    });
    
    eventBus.publish(CoreDiagramEvents.ELEMENT_REMOVED, id);
  },
  
  // Relationship actions
  selectRelationship: (id) => {
    set({ 
      selectedRelationshipId: id, 
      selectedElementId: null,
      selectedElementIds: []
    });
    eventBus.publish(CoreDiagramEvents.RELATIONSHIP_SELECTED, id);
  },
  
  addRelationship: (relationship) => {
    const diagram = get().getActiveDiagram();
    if (!diagram) return;
    
    set(state => {
      const updatedDiagrams = state.project.diagrams.map(d => {
        if (d.id === diagram.id) {
          return {
            ...d,
            relationships: [...d.relationships, relationship]
          };
        }
        return d;
      });
      
      return {
        project: {
          ...state.project,
          diagrams: updatedDiagrams
        },
        selectedRelationshipId: relationship.id,
        selectedElementId: null,
        selectedElementIds: []
      };
    });
    
    eventBus.publish(CoreDiagramEvents.RELATIONSHIP_ADDED, relationship);
  },
  
  updateRelationship: (id, updates) => {
    const diagram = get().getActiveDiagram();
    if (!diagram) return;
    
    set(state => {
      const updatedDiagrams = state.project.diagrams.map(d => {
        if (d.id === diagram.id) {
          return {
            ...d,
            relationships: d.relationships.map(rel => {
              if (rel.id === id) {
                const updatedRel = { ...rel, ...updates };
                eventBus.publish(CoreDiagramEvents.RELATIONSHIP_UPDATED, updatedRel);
                return updatedRel;
              }
              return rel;
            })
          };
        }
        return d;
      });
      
      return {
        project: {
          ...state.project,
          diagrams: updatedDiagrams
        }
      };
    });
  },
  
  removeRelationship: (id) => {
    const diagram = get().getActiveDiagram();
    if (!diagram) return;
    
    set(state => {
      const updatedDiagrams = state.project.diagrams.map(d => {
        if (d.id === diagram.id) {
          return {
            ...d,
            relationships: d.relationships.filter(rel => rel.id !== id)
          };
        }
        return d;
      });
      
      return {
        project: {
          ...state.project,
          diagrams: updatedDiagrams
        },
        selectedRelationshipId: state.selectedRelationshipId === id ? null : state.selectedRelationshipId
      };
    });
    
    eventBus.publish(CoreDiagramEvents.RELATIONSHIP_REMOVED, id);
  },
  
  // Relationship creation
  startCreatingRelationship: (sourceId, type) => {
    set({ 
      isCreatingRelationship: true, 
      relationshipSourceId: sourceId, 
      relationshipType: type 
    });
  },
  
  cancelCreatingRelationship: () => {
    set({ 
      isCreatingRelationship: false, 
      relationshipSourceId: null, 
      relationshipType: null 
    });
  },
  
  completeRelationship: (targetId) => {
    const { relationshipSourceId, relationshipType } = get();
    if (!relationshipSourceId || !relationshipType) return;
    
    const newRelationship = {
      id: uuidv4(),
      type: relationshipType as any,
      name: `${relationshipType} Relationship`,
      sourceId: relationshipSourceId,
      targetId
    };
    
    get().addRelationship(newRelationship);
    get().cancelCreatingRelationship();
  },
  
  // Dragging state
  startDragging: () => set({ isDragging: true }),
  stopDragging: () => set({ isDragging: false }),
  
  // Zoom actions
  setScale: (scale) => set({ scale })
}));

// Initialize the active diagram ID
useModelingStore.setState(state => ({
  activeDiagramId: state.project.diagrams[0].id
}));

// Define extended diagram events separately to avoid conflicts
export const DiagramEventsExtended = {
  ...CoreDiagramEvents,
  MULTIPLE_ELEMENTS_SELECTED: 'elements:selected'
};
