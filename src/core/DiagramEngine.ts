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
  
  /**
   * Select multiple elements
   */
  selectMultipleElements(ids: string[]): void {
    if (ids.length === 0) {
      useModelingStore.getState().selectElement(null);
      return;
    }
    
    if (ids.length === 1) {
      useModelingStore.getState().selectElement(ids[0]);
      return;
    }
    
    useModelingStore.getState().selectMultipleElements(ids);
  }
  
  /**
   * Align multiple elements
   */
  alignElements(ids: string[], direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'): void {
    if (ids.length <= 1) return;
    
    const store = useModelingStore.getState();
    const diagram = store.getActiveDiagram();
    if (!diagram) return;
    
    const elements = diagram.elements.filter(el => ids.includes(el.id));
    if (elements.length <= 1) return;
    
    const originalPositions = elements.map(el => ({ id: el.id, position: { ...el.position } }));
    
    // Calculate target position based on alignment type
    let targetValue: number;
    
    switch (direction) {
      case 'left': {
        targetValue = Math.min(...elements.map(el => el.position.x));
        const updatedElements = elements.map(el => ({
          ...el,
          position: { ...el.position, x: targetValue }
        }));
        break;
      }
      case 'center': {
        const centers = elements.map(el => el.position.x + el.size.width / 2);
        targetValue = centers.reduce((sum, val) => sum + val, 0) / centers.length;
        const updatedElements = elements.map(el => ({
          ...el,
          position: { 
            ...el.position, 
            x: targetValue - el.size.width / 2 
          }
        }));
        break;
      }
      case 'right': {
        const rights = elements.map(el => el.position.x + el.size.width);
        targetValue = Math.max(...rights);
        const updatedElements = elements.map(el => ({
          ...el,
          position: { 
            ...el.position, 
            x: targetValue - el.size.width 
          }
        }));
        break;
      }
      case 'top': {
        targetValue = Math.min(...elements.map(el => el.position.y));
        const updatedElements = elements.map(el => ({
          ...el,
          position: { ...el.position, y: targetValue }
        }));
        break;
      }
      case 'middle': {
        const middles = elements.map(el => el.position.y + el.size.height / 2);
        targetValue = middles.reduce((sum, val) => sum + val, 0) / middles.length;
        const updatedElements = elements.map(el => ({
          ...el,
          position: { 
            ...el.position, 
            y: targetValue - el.size.height / 2 
          }
        }));
        break;
      }
      case 'bottom': {
        const bottoms = elements.map(el => el.position.y + el.size.height);
        targetValue = Math.max(...bottoms);
        const updatedElements = elements.map(el => ({
          ...el,
          position: { 
            ...el.position, 
            y: targetValue - el.size.height 
          }
        }));
        break;
      }
    }
    
    // Create alignment command
    const alignCommand: Command = {
      execute: () => {
        elements.forEach(el => {
          switch (direction) {
            case 'left':
              store.updateElement(el.id, { 
                position: { ...el.position, x: targetValue } 
              });
              break;
            case 'center': {
              const centerX = targetValue;
              store.updateElement(el.id, { 
                position: { ...el.position, x: centerX - el.size.width / 2 } 
              });
              break;
            }
            case 'right': {
              const rightX = targetValue;
              store.updateElement(el.id, { 
                position: { ...el.position, x: rightX - el.size.width } 
              });
              break;
            }
            case 'top':
              store.updateElement(el.id, { 
                position: { ...el.position, y: targetValue } 
              });
              break;
            case 'middle': {
              const middleY = targetValue;
              store.updateElement(el.id, { 
                position: { ...el.position, y: middleY - el.size.height / 2 } 
              });
              break;
            }
            case 'bottom': {
              const bottomY = targetValue;
              store.updateElement(el.id, { 
                position: { ...el.position, y: bottomY - el.size.height } 
              });
              break;
            }
          }
        });
      },
      undo: () => {
        originalPositions.forEach(item => {
          store.updateElement(item.id, { position: item.position });
        });
      },
      redo: function() { 
        this.execute(); 
      },
      getDescription: () => `Align elements ${direction}`
    };
    
    commandHistory.execute(alignCommand);
  }
  
  /**
   * Delete multiple elements
   */
  deleteMultipleElements(ids: string[]): void {
    if (ids.length === 0) return;
    
    const store = useModelingStore.getState();
    const diagram = store.getActiveDiagram();
    if (!diagram) return;
    
    const elementsToDelete = diagram.elements.filter(el => ids.includes(el.id));
    
    // Also find relationships that will be affected
    const relatedRelationships = diagram.relationships.filter(
      r => ids.includes(r.sourceId) || ids.includes(r.targetId)
    );
    
    const deleteCommand: Command = {
      execute: () => {
        ids.forEach(id => store.removeElement(id));
      },
      undo: () => {
        elementsToDelete.forEach(element => store.addElement(element));
        relatedRelationships.forEach(relationship => store.addRelationship(relationship));
      },
      redo: function() { this.execute(); },
      getDescription: () => `Delete ${ids.length} elements`
    };
    
    commandHistory.execute(deleteCommand);
  }
}

// Export singleton instance
export const diagramEngine = new DiagramEngine();
