
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
  
  state.selectMultipleElements(validIds);
  
  if (validIds.length > 0) {
    eventBus.publish(DiagramEventsExtended.MULTIPLE_ELEMENTS_SELECTED, validIds);
  }
}

/**
 * Select a relationship
 */
function selectRelationship(relationshipId: string | null) {
  const state = useModelingStore.getState();
  state.selectRelationship(relationshipId);
  
  if (relationshipId) {
    eventBus.publish(DiagramEvents.RELATIONSHIP_SELECTED, relationshipId);
  }
}

export const selectionOperations = {
  selectElement,
  selectMultipleElements,
  selectRelationship
};
