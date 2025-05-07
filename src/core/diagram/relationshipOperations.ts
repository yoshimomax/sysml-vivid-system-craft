
import { v4 as uuidv4 } from 'uuid';
import { useModelingStore } from "../../store/modelingStore";
import { Relationship, RelationshipType, Position } from "../../model/types";
import { eventBus } from '../EventBus';
import { DiagramEvents } from '../EventBus';

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
  
  state.addRelationship(newRelationship);
  eventBus.publish(DiagramEvents.RELATIONSHIP_ADDED, newRelationship);
  
  return newRelationship;
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
 * Delete a relationship
 */
function deleteRelationship(relationshipId: string) {
  const state = useModelingStore.getState();
  const activeDiagramId = state.activeDiagramId;
  
  if (!activeDiagramId) {
    console.error("No active diagram to delete relationship from");
    return;
  }
  
  state.removeRelationship(relationshipId);
  eventBus.publish(DiagramEvents.RELATIONSHIP_REMOVED, relationshipId);
  
  // Clear selection if this was the selected relationship
  if (state.selectedRelationshipId === relationshipId) {
    state.selectRelationship(null);
  }
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

export const relationshipOperations = {
  createRelationship,
  updateRelationship,
  deleteRelationship,
  startRelationshipCreation,
  completeRelationshipCreation,
  cancelRelationshipCreation
};
