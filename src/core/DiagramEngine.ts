
import { v4 as uuidv4 } from 'uuid';
import { useModelingStore } from "../store/modelingStore";
import { Element, Relationship, ElementType, RelationshipType, Position } from "../model/types";
import { eventBus, DiagramEvents } from './EventBus';

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
  
  state.addElement(activeDiagramId, newElement);
  eventBus.publish(DiagramEvents.ELEMENT_ADDED, newElement);
  
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
  waypoints?: Position[]
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
    waypoints: waypoints || []
  };
  
  state.addRelationship(activeDiagramId, newRelationship);
  eventBus.publish(DiagramEvents.RELATIONSHIP_ADDED, newRelationship);
  
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
      eventBus.publish(DiagramEvents.RELATIONSHIP_REMOVED, rel.id);
    });
  }
  
  // Then delete the element itself
  state.removeElement(activeDiagramId, elementId);
  eventBus.publish(DiagramEvents.ELEMENT_REMOVED, elementId);
  
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
  eventBus.publish(DiagramEvents.RELATIONSHIP_REMOVED, relationshipId);
  
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
    eventBus.publish(DiagramEventsExtended.MULTIPLE_ELEMENTS_SELECTED, elementIds);
  }
}

/**
 * Delete multiple elements at once
 */
function deleteMultipleElements(elementIds: string[]) {
  elementIds.forEach(id => deleteElement(id));
}

/**
 * Align multiple elements
 */
function alignElements(elementIds: string[], direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') {
  const state = useModelingStore.getState();
  const elements = elementIds.map(id => state.getActiveDiagram()?.elements.find(e => e.id === id)).filter(Boolean) as Element[];
  
  if (elements.length <= 1) return;
  
  // Calculate bounds
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  
  elements.forEach(el => {
    minX = Math.min(minX, el.position.x);
    maxX = Math.max(maxX, el.position.x + el.size.width);
    minY = Math.min(minY, el.position.y);
    maxY = Math.max(maxY, el.position.y + el.size.height);
  });
  
  // Perform alignment
  elements.forEach(el => {
    const updates: Partial<Element> = { position: { ...el.position } };
    
    switch (direction) {
      case 'left':
        updates.position.x = minX;
        break;
      case 'center':
        updates.position.x = (minX + maxX) / 2 - el.size.width / 2;
        break;
      case 'right':
        updates.position.x = maxX - el.size.width;
        break;
      case 'top':
        updates.position.y = minY;
        break;
      case 'middle':
        updates.position.y = (minY + maxY) / 2 - el.size.height / 2;
        break;
      case 'bottom':
        updates.position.y = maxY - el.size.height;
        break;
    }
    
    updateElement(el.id, updates);
  });
}

/**
 * Start relationship creation
 */
function startRelationshipCreation(sourceId: string, type: RelationshipType) {
  const state = useModelingStore.getState();
  state.startCreatingRelationship(sourceId, type);
}

/**
 * Complete relationship creation
 */
function completeRelationshipCreation(targetId: string) {
  const state = useModelingStore.getState();
  const sourceId = state.relationshipSourceId;
  const type = state.relationshipType;
  
  if (sourceId && type) {
    // Convert the type string to RelationshipType
    createRelationship(type as RelationshipType, sourceId, targetId);
  }
  
  // Reset relationship creation state
  cancelRelationshipCreation();
}

/**
 * Cancel relationship creation
 */
function cancelRelationshipCreation() {
  const state = useModelingStore.getState();
  state.cancelCreatingRelationship();
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
  deleteMultipleElements,
  alignElements,
  selectRelationship,
  getState,
  getElementById,
  zoomIn,
  zoomOut,
  startRelationshipCreation,
  completeRelationshipCreation,
  cancelRelationshipCreation
};
