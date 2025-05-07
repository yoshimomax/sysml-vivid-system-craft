import { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { ModelingState, RelationshipState } from '../types/storeTypes';
import { eventBus, DiagramEvents } from '../../core/EventBus';
import { RelationshipType } from '../../model/types';

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
    const { relationshipSourceId, relationshipType, getActiveDiagram } = get();
    
    if (!relationshipSourceId || !relationshipType || relationshipSourceId === targetId) {
      // Cannot create relationship to self or without source/type
      set({
        isCreatingRelationship: false,
        relationshipSourceId: null,
        relationshipType: null
      });
      return;
    }
    
    const relationship = {
      id: uuidv4(),
      type: relationshipType as RelationshipType, // Cast to RelationshipType
      sourceId: relationshipSourceId,
      targetId,
      name: `${relationshipType} Relationship`
    };
    
    // Add relationship to current diagram
    get().addRelationship(relationship);
    
    // Reset relationship creation state
    set({
      isCreatingRelationship: false,
      relationshipSourceId: null,
      relationshipType: null
    });
    
    eventBus.publish(DiagramEvents.RELATIONSHIP_ADDED, relationship);
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
        selectedRelationshipId: relationship.id
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
                const updatedRelationship = { ...rel, ...updates };
                eventBus.publish(DiagramEvents.RELATIONSHIP_UPDATED, updatedRelationship);
                return updatedRelationship;
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
  }
});
