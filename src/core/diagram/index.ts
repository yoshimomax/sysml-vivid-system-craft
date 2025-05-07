
// Export all diagram engine modules from a single entry point
import { elementOperations } from './elementOperations';
import { relationshipOperations } from './relationshipOperations';
import { selectionOperations } from './selectionOperations';
import { canvasOperations } from './canvasOperations';
import { alignmentOperations } from './alignmentOperations';

// Combine all operations into a single diagramEngine object
export const diagramEngine = {
  // Element operations
  createElement: elementOperations.createElement,
  updateElement: elementOperations.updateElement,
  deleteElement: elementOperations.deleteElement,
  getElementById: elementOperations.getElementById,
  deleteMultipleElements: elementOperations.deleteMultipleElements,
  
  // Relationship operations
  createRelationship: relationshipOperations.createRelationship,
  updateRelationship: relationshipOperations.updateRelationship,
  deleteRelationship: relationshipOperations.deleteRelationship,
  startRelationshipCreation: relationshipOperations.startRelationshipCreation,
  completeRelationshipCreation: relationshipOperations.completeRelationshipCreation,
  cancelRelationshipCreation: relationshipOperations.cancelRelationshipCreation,
  
  // Selection operations
  selectElement: selectionOperations.selectElement,
  selectMultipleElements: selectionOperations.selectMultipleElements,
  selectRelationship: selectionOperations.selectRelationship,
  
  // Canvas operations
  zoomIn: canvasOperations.zoomIn,
  zoomOut: canvasOperations.zoomOut,
  getState: canvasOperations.getState,
  
  // Alignment operations
  alignElements: alignmentOperations.alignElements
};
