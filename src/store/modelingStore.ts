
import { create } from 'zustand';
import { ModelingState } from './types/storeTypes';
import { createProjectSlice } from './slices/projectSlice';
import { createElementSlice } from './slices/elementSlice';
import { createRelationshipSlice } from './slices/relationshipSlice';
import { createSelectionSlice } from './slices/selectionSlice';
import { createUISlice } from './slices/uiSlice';
import { DiagramEvents } from '../core/EventBus';

// Create the store by combining all slices
export const useModelingStore = create<ModelingState>()((...a) => ({
  ...createProjectSlice(...a),
  ...createElementSlice(...a),
  ...createRelationshipSlice(...a),
  ...createSelectionSlice(...a),
  ...createUISlice(...a)
}));

// Initialize the active diagram ID
useModelingStore.setState(state => ({
  activeDiagramId: state.project.diagrams[0].id
}));

// Define extended diagram events separately to avoid conflicts
export const DiagramEventsExtended = {
  ...DiagramEvents,
  MULTIPLE_ELEMENTS_SELECTED: 'elements:selected'
};
