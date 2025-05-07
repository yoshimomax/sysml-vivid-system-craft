
import { StateCreator } from 'zustand';
import { ModelingState, SelectionState } from '../types/storeTypes';
import { eventBus } from '../../core/EventBus';
import { DiagramEventsExtended } from '../modelingStore';

// Selection state slice
export const createSelectionSlice: StateCreator<
  ModelingState,
  [],
  [],
  SelectionState
> = (set, get) => ({
  // State
  selectedElementId: null,
  selectedElementIds: [],
  selectedRelationshipId: null,
  
  // Getters
  getSelectedElement: () => {
    const { selectedElementId, getActiveDiagram } = get();
    if (!selectedElementId) return null;
    
    const diagram = getActiveDiagram();
    return diagram?.elements.find(e => e.id === selectedElementId) || null;
  },
  
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
  
  // Actions
  selectElement: (id) => {
    set({ 
      selectedElementId: id, 
      selectedElementIds: id ? [id] : [], 
      selectedRelationshipId: null 
    });
    eventBus.publish(DiagramEventsExtended.ELEMENT_SELECTED, id);
  },
  
  selectMultipleElements: (ids) => {
    set({ 
      selectedElementIds: ids,
      selectedElementId: ids.length === 1 ? ids[0] : null,
      selectedRelationshipId: null
    });
    eventBus.publish(DiagramEventsExtended.MULTIPLE_ELEMENTS_SELECTED, ids);
  },
  
  selectRelationship: (id) => {
    set({ 
      selectedRelationshipId: id, 
      selectedElementId: null,
      selectedElementIds: []
    });
    eventBus.publish(DiagramEventsExtended.RELATIONSHIP_SELECTED, id);
  }
});
