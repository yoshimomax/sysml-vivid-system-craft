
import { useModelingStore } from "../../store/modelingStore";
import { eventBus } from '../EventBus';
import { DiagramEvents } from '../EventBus';
import { DiagramEventsExtended } from '../../store/modelingStore';

/**
 * Select an element
 */
function selectElement(elementId: string | null) {
  const state = useModelingStore.getState();
  state.selectElement(elementId);
  
  if (elementId) {
    eventBus.publish(DiagramEvents.ELEMENT_SELECTED, elementId);
  } else {
    // Clear multi-selection when single selection is cleared
    state.selectMultipleElements([]);
  }
}

/**
 * Select multiple elements
 */
function selectMultipleElements(elementIds: string[]) {
  console.log("selectionOperations.selectMultipleElements:", elementIds);
  const state = useModelingStore.getState();
  
  // Make sure we have a valid array of element IDs
  const validIds = Array.isArray(elementIds) ? elementIds : [];
  
  // Apply the selection to the store
  state.selectMultipleElements(validIds);
  
  // Broadcast the selection event if we have selected elements
  if (validIds.length > 0) {
    eventBus.publish(DiagramEventsExtended.MULTIPLE_ELEMENTS_SELECTED, validIds);
    
    // If only one element is selected, also set it as the selected element
    if (validIds.length === 1) {
      state.selectElement(validIds[0]);
    } else {
      // If multiple elements are selected, clear the single selection
      state.selectElement(null);
    }
  } else {
    // If no elements are selected, make sure to clear the selection
    state.selectElement(null);
  }
}

/**
 * Select a relationship
 */
function selectRelationship(relationshipId: string | null) {
  const state = useModelingStore.getState();
  state.selectRelationship(relationshipId);
  
  // Clear element selections when selecting a relationship
  if (relationshipId) {
    state.selectElement(null);
    state.selectMultipleElements([]);
    eventBus.publish(DiagramEvents.RELATIONSHIP_SELECTED, relationshipId);
  }
}

/**
 * Toggle element selection (for shift+click)
 */
function toggleElementSelection(elementId: string) {
  const state = useModelingStore.getState();
  const currentSelection = state.selectedElementIds;
  
  let newSelection: string[];
  
  if (currentSelection.includes(elementId)) {
    // Remove element from selection if it's already selected
    newSelection = currentSelection.filter(id => id !== elementId);
  } else {
    // Add element to selection if it's not already selected
    newSelection = [...currentSelection, elementId];
  }
  
  state.selectMultipleElements(newSelection);
  
  if (newSelection.length > 0) {
    eventBus.publish(DiagramEventsExtended.MULTIPLE_ELEMENTS_SELECTED, newSelection);
  }
}

export const selectionOperations = {
  selectElement,
  selectMultipleElements,
  selectRelationship,
  toggleElementSelection
};
