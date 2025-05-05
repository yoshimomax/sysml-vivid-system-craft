
import { Element, Relationship, Position, ElementType, Size } from "../model/types";
import { v4 as uuidv4 } from "uuid";
import { useModelingStore } from "../store/modelingStore";
import { eventBus, DiagramEvents } from "./EventBus";
import { Command, commandHistory } from "./CommandSystem";

/**
 * DiagramEngine provides a façade for diagram operations
 */
export class DiagramEngine {
  /**
   * Create a new element in the diagram
   */
  createElement(type: ElementType, position: Position, size: Size, name?: string): Element {
    const element: Element = {
      id: uuidv4(),
      type,
      name: name || `New ${type}`,
      position,
      size,
      description: "",
    };
    
    const addElementCommand: Command = {
      execute: () => useModelingStore.getState().addElement(element),
      undo: () => useModelingStore.getState().removeElement(element.id),
      redo: () => useModelingStore.getState().addElement(element),
      getDescription: () => `Add ${type} element`
    };
    
    commandHistory.execute(addElementCommand);
    return element;
  }
  
  /**
   * Update an element
   */
  updateElement(id: string, updates: Partial<Element>): void {
    const store = useModelingStore.getState();
    const originalElement = store.getSelectedElement();
    
    if (!originalElement) return;
    
    const updateElementCommand: Command = {
      execute: () => store.updateElement(id, updates),
      undo: () => store.updateElement(id, originalElement),
      redo: () => store.updateElement(id, updates),
      getDescription: () => `Update ${originalElement.type} element`
    };
    
    commandHistory.execute(updateElementCommand);
  }
  
  /**
   * Remove an element
   */
  removeElement(id: string): void {
    const store = useModelingStore.getState();
    const diagram = store.getActiveDiagram();
    const element = diagram?.elements.find(e => e.id === id);
    
    if (!element || !diagram) return;
    
    // Find relationships that will be affected
    const relatedRelationships = diagram.relationships.filter(
      r => r.sourceId === id || r.targetId === id
    );
    
    const removeElementCommand: Command = {
      execute: () => store.removeElement(id),
      undo: () => {
        store.addElement(element);
        relatedRelationships.forEach(r => store.addRelationship(r));
      },
      redo: () => store.removeElement(id),
      getDescription: () => `Remove ${element.type} element`
    };
    
    commandHistory.execute(removeElementCommand);
  }
  
  /**
   * Create a relationship between elements
   */
  createRelationship(sourceId: string, targetId: string, type: string, name?: string): Relationship {
    const relationship: Relationship = {
      id: uuidv4(),
      type: type as any,
      name: name || `${type} Relationship`,
      sourceId,
      targetId
    };
    
    const addRelationshipCommand: Command = {
      execute: () => useModelingStore.getState().addRelationship(relationship),
      undo: () => useModelingStore.getState().removeRelationship(relationship.id),
      redo: () => useModelingStore.getState().addRelationship(relationship),
      getDescription: () => `Add ${type} relationship`
    };
    
    commandHistory.execute(addRelationshipCommand);
    return relationship;
  }
  
  /**
   * Move an element to a new position
   */
  moveElement(id: string, newPosition: Position): void {
    const store = useModelingStore.getState();
    const element = store.getActiveDiagram()?.elements.find(e => e.id === id);
    
    if (!element) return;
    
    const originalPosition = { ...element.position };
    
    const moveElementCommand: Command = {
      execute: () => store.updateElement(id, { position: newPosition }),
      undo: () => store.updateElement(id, { position: originalPosition }),
      redo: () => store.updateElement(id, { position: newPosition }),
      getDescription: () => `Move ${element.type} element`
    };
    
    commandHistory.execute(moveElementCommand);
  }
  
  /**
   * Select an element
   */
  selectElement(id: string | null): void {
    useModelingStore.getState().selectElement(id);
  }
  
  /**
   * Select a relationship
   */
  selectRelationship(id: string | null): void {
    useModelingStore.getState().selectRelationship(id);
  }
  
  /**
   * Start creating a relationship
   */
  startRelationshipCreation(sourceId: string, type: string): void {
    useModelingStore.getState().startCreatingRelationship(sourceId, type);
  }
  
  /**
   * Cancel relationship creation
   */
  cancelRelationshipCreation(): void {
    useModelingStore.getState().cancelCreatingRelationship();
  }
  
  /**
   * Complete relationship creation by connecting to target
   */
  completeRelationshipCreation(targetId: string): void {
    useModelingStore.getState().completeRelationship(targetId);
  }
}

// Export singleton instance
export const diagramEngine = new DiagramEngine();
