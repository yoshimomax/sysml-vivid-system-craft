
import { StateCreator } from 'zustand';
import { ModelingState } from '../types/storeTypes';
import { eventBus, DiagramEventsExtended } from '../../core/EventBus';

// Element state slice
export const createElementSlice: StateCreator<
  ModelingState,
  [],
  [],
  Pick<ModelingState, keyof ModelingState>
> = (set, get) => ({
  // Actions
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
    
    eventBus.publish(DiagramEventsExtended.ELEMENT_ADDED, element);
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
                eventBus.publish(DiagramEventsExtended.ELEMENT_UPDATED, updatedElement);
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
        selectedElementIds: state.selectedElementIds.filter(elId => elId !== id)
      };
    });
    
    eventBus.publish(DiagramEventsExtended.ELEMENT_REMOVED, id);
  }
});
