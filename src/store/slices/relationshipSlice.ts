
import { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { ModelingState, RelationshipState } from '../types/storeTypes';
import { eventBus, DiagramEventsExtended } from '../../core/EventBus';

// Relationship state slice
export const createRelationshipSlice: StateCreator<
  ModelingState,
  [],
  [],
  RelationshipState
> = (set, get) => ({
  // State
  isCreatingRelationship: false,
  relationshipSourceId: null,
  relationshipType: null,
  
  // Actions
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
    
    eventBus.publish(DiagramEventsExtended.RELATIONSHIP_ADDED, relationship);
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
                eventBus.publish(DiagramEventsExtended.RELATIONSHIP_UPDATED, updatedRel);
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
    
    eventBus.publish(DiagramEventsExtended.RELATIONSHIP_REMOVED, id);
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
  }
});
