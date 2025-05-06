import { v4 as uuidv4 } from 'uuid';
import { useModelingStore } from "../store/modelingStore";
import { Element, Relationship, ElementType, RelationshipType, Position } from "../model/types";
import { eventBus, DiagramEvents } from './EventBus';

/**
 * Create a new element
 */
function createElement(type: ElementType, name: string, position: Position, properties?: Record<string, any>) {
  const state = useModelingStore.getState();
  const activeDiagramId = state.activeDiagramId;
  
  if (!activeDiagramId) {
    console.error("No active diagram to add element to");
    return null;
  }
  
  const newElement: Element = {
    id: uuidv4(),
    type,
    name,
    position,
    size: { width: 150, height: 100 },
    properties: properties || {}
  };
  
  state.addElement(activeDiagramId, newElement);
  eventBus.publish(DiagramEvents.ELEMENT_CREATED, newElement);
  
  return newElement;
}

/**
 * Create a new relationship
 */
function createRelationship(
  type: RelationshipType,
  sourceId: string,
  targetId: string,
  name?: string,
  points?: Position[]
) {
  const state = useModelingStore.getState();
  const activeDiagramId = state.activeDiagramId;
  
  if (!activeDiagramId) {
    console.error("No active diagram to add relationship to");
    return null;
  }
  
  const newRelationship: Relationship = {
    id: uuidv4(),
    type,
    sourceId,
    targetId,
    name: name || '',
    points: points || []
  };
  
  state.addRelationship(activeDiagramId, newRelationship);
  eventBus.publish(DiagramEvents.RELATIONSHIP_CREATED, newRelationship);
  
  return newRelationship;
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
 * Update a relationship
 */
function updateRelationship(relationshipId: string, updates: Partial<Relationship>) {
  const state = useModelingStore.getState();
  state.updateRelationship(relationshipId, updates);
  
  const updatedRelationship = state.getActiveDiagram()?.relationships.find(r => r.id === relationshipId);
  if (updatedRelationship) {
    eventBus.publish(DiagramEvents.RELATIONSHIP_UPDATED, updatedRelationship);
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
      state.removeRelationship(activeDiagramId, rel.id);
      eventBus.publish(DiagramEvents.RELATIONSHIP_DELETED, rel.id);
    });
  }
  
  // Then delete the element itself
  state.removeElement(activeDiagramId, elementId);
  eventBus.publish(DiagramEvents.ELEMENT_DELETED, elementId);
  
  // Clear selection if this was the selected element
  if (state.selectedElementId === elementId) {
    state.selectElement(null);
  }
}

/**
 * Delete a relationship
 */
function deleteRelationship(relationshipId: string) {
  const state = useModelingStore.getState();
  const activeDiagramId = state.activeDiagramId;
  
  if (!activeDiagramId) {
    console.error("No active diagram to delete relationship from");
    return;
  }
  
  state.removeRelationship(activeDiagramId, relationshipId);
  eventBus.publish(DiagramEvents.RELATIONSHIP_DELETED, relationshipId);
  
  // Clear selection if this was the selected relationship
  if (state.selectedRelationshipId === relationshipId) {
    state.selectRelationship(null);
  }
}

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
  const state = useModelingStore.getState();
  state.selectMultipleElements(elementIds);
  
  if (elementIds.length > 0) {
    eventBus.publish(DiagramEvents.ELEMENT_SELECTED, elementIds);
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

/**
 * Get the current state
 */
function getState() {
  return useModelingStore.getState();
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
 * Zoom in on the canvas
 */
function zoomIn() {
  const state = useModelingStore.getState();
  const currentScale = state.scale;
  const maxScale = 2;
  const step = 0.1;
  
  const newScale = Math.min(currentScale + step, maxScale);
  state.setScale(newScale);
}

/**
 * Zoom out on the canvas
 */
function zoomOut() {
  const state = useModelingStore.getState();
  const currentScale = state.scale;
  const minScale = 0.5;
  const step = 0.1;
  
  const newScale = Math.max(currentScale - step, minScale);
  state.setScale(newScale);
}

// Add the new methods to the export
export const diagramEngine = {
  createElement,
  createRelationship,
  updateElement,
  updateRelationship,
  deleteElement,
  deleteRelationship,
  selectElement,
  selectMultipleElements,
  selectRelationship,
  getState,
  getElementById,
  zoomIn,
  zoomOut
};
