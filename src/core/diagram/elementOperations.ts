
import { v4 as uuidv4 } from 'uuid';
import { useModelingStore } from "../../store/modelingStore";
import { Element, ElementType, Position } from "../../model/types";
import { eventBus } from '../EventBus';
import { DiagramEvents } from '../EventBus';

/**
 * Create a new element
 */
function createElement(type: ElementType, position: Position, size?: { width: number, height: number }, name?: string, properties?: Record<string, any>) {
  const state = useModelingStore.getState();
  const activeDiagramId = state.activeDiagramId;
  
  if (!activeDiagramId) {
    console.error("No active diagram to add element to");
    return null;
  }
  
  const newElement: Element = {
    id: uuidv4(),
    type,
    name: name || `New ${type}`,
    position,
    size: size || { width: 150, height: 100 },
    properties: properties || {}
  };
  
  state.addElement(newElement);
  eventBus.publish(DiagramEvents.ELEMENT_ADDED, newElement);
  
  return newElement;
}

/**
 * Update an element
 */
function updateElement(elementId: string, updates: Partial<Element>) {
  const state = useModelingStore.getState();
  state.updateElement(elementId, updates);
  
  const updatedElement = state.getActiveDiagram()?.elements.find(e => e.id === elementId);
  if (updatedElement) {
    eventBus.publish(DiagramEvents.ELEMENT_UPDATED, updatedElement);
  }
}

/**
 * Delete an element
 */
function deleteElement(elementId: string) {
  const state = useModelingStore.getState();
  const activeDiagramId = state.activeDiagramId;
  
  if (!activeDiagramId) {
    console.error("No active diagram to delete element from");
    return;
  }
  
  // First, delete any relationships connected to this element
  const diagram = state.getActiveDiagram();
  if (diagram) {
    const relatedRelationships = diagram.relationships.filter(
      r => r.sourceId === elementId || r.targetId === elementId
    );
    
    relatedRelationships.forEach(rel => {
      state.removeRelationship(rel.id);
      eventBus.publish(DiagramEvents.RELATIONSHIP_REMOVED, rel.id);
    });
  }
  
  // Then delete the element itself
  state.removeElement(elementId);
  eventBus.publish(DiagramEvents.ELEMENT_REMOVED, elementId);
  
  // Clear selection if this was the selected element
  if (state.selectedElementId === elementId) {
    state.selectElement(null);
  }
}

/**
 * Get an element by ID from the active diagram
 */
function getElementById(elementId: string) {
  const state = useModelingStore.getState();
  const diagram = state.getActiveDiagram();
  return diagram?.elements.find(e => e.id === elementId);
}

/**
 * Delete multiple elements at once
 */
function deleteMultipleElements(elementIds: string[]) {
  elementIds.forEach(id => deleteElement(id));
}

export const elementOperations = {
  createElement,
  updateElement,
  deleteElement,
  getElementById,
  deleteMultipleElements
};
