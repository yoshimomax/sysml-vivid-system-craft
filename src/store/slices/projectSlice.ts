
import { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { ModelingState, ProjectState } from '../types/storeTypes';
import { eventBus } from '../../core/EventBus';
import { DiagramEventsExtended } from '../modelingStore';

// Project state slice
export const createProjectSlice: StateCreator<
  ModelingState,
  [],
  [],
  ProjectState
> = (set, get) => ({
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
  
  // Getters
  getActiveDiagram: () => {
    const { project, activeDiagramId } = get();
    return project.diagrams.find(d => d.id === activeDiagramId) || project.diagrams[0];
  },
  
  // Actions
  selectDiagram: (id) => {
    set({ activeDiagramId: id, selectedElementId: null, selectedRelationshipId: null });
    eventBus.publish(DiagramEventsExtended.DIAGRAM_CHANGED, id);
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
    
    eventBus.publish(DiagramEventsExtended.DIAGRAM_CHANGED, newDiagram.id);
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
    
    eventBus.publish(DiagramEventsExtended.DIAGRAM_CHANGED, newActiveId);
  }
});
