
import { create } from 'zustand';
import { Diagram, Element, Project, Relationship } from '../model/types';
import { v4 as uuidv4 } from 'uuid';
import { eventBus, DiagramEvents } from '../core/EventBus';

// Store state interface
interface ModelingState {
  // Data
  project: Project;
  activeDiagramId: string;
  selectedElementId: string | null;
  selectedRelationshipId: string | null;
  
  // UI State
  isCreatingRelationship: boolean;
  relationshipSourceId: string | null;
  relationshipType: string | null;
  isDragging: boolean;
  
  // Getters
  getActiveDiagram: () => Diagram | undefined;
  getSelectedElement: () => Element | null;
  getSelectedRelationship: () => Relationship | null;
  
  // Actions
  selectDiagram: (id: string) => void;
  addDiagram: (name: string, type: Diagram['type']) => void;
  removeDiagram: (id: string) => void;
  
  selectElement: (id: string | null) => void;
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
  selectedRelationshipId: null,
  isCreatingRelationship: false,
  relationshipSourceId: null,
  relationshipType: null,
  isDragging: false,
  
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
  
  getSelectedRelationship: () => {
    const { selectedRelationshipId, getActiveDiagram } = get();
    if (!selectedRelationshipId) return null;
    
    const diagram = getActiveDiagram();
    return diagram?.relationships.find(r => r.id === selectedRelationshipId) || null;
  },
  
  // Diagram actions
  selectDiagram: (id) => {
    set({ activeDiagramId: id, selectedElementId: null, selectedRelationshipId: null });
    eventBus.publish(DiagramEvents.DIAGRAM_CHANGED, id);
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
    
    eventBus.publish(DiagramEvents.DIAGRAM_CHANGED, newDiagram.id);
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
    
    eventBus.publish(DiagramEvents.DIAGRAM_CHANGED, newActiveId);
  },
  
  // Element actions
  selectElement: (id) => {
    set({ 
      selectedElementId: id, 
      selectedRelationshipId: null 
    });
    eventBus.publish(DiagramEvents.ELEMENT_SELECTED, id);
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
        selectedRelationshipId: null
      };
    });
    
    eventBus.publish(DiagramEvents.ELEMENT_ADDED, element);
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
                eventBus.publish(DiagramEvents.ELEMENT_UPDATED, updatedElement);
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
      };
    });
    
    eventBus.publish(DiagramEvents.ELEMENT_REMOVED, id);
  },
  
  // Relationship actions
  selectRelationship: (id) => {
    set({ 
      selectedRelationshipId: id, 
      selectedElementId: null 
    });
    eventBus.publish(DiagramEvents.RELATIONSHIP_SELECTED, id);
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
        selectedElementId: null
      };
    });
    
    eventBus.publish(DiagramEvents.RELATIONSHIP_ADDED, relationship);
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
                eventBus.publish(DiagramEvents.RELATIONSHIP_UPDATED, updatedRel);
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
    
    eventBus.publish(DiagramEvents.RELATIONSHIP_REMOVED, id);
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
  stopDragging: () => set({ isDragging: false })
}));

// Initialize the active diagram ID
useModelingStore.setState(state => ({
  activeDiagramId: state.project.diagrams[0].id
}));
