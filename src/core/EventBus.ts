
type EventHandler = (...args: any[]) => void;

/**
 * EventBus for communication between components
 */
class EventBus {
  private handlers: Record<string, EventHandler[]> = {};
  
  /**
   * Subscribe to an event
   */
  subscribe(event: string, handler: EventHandler): () => void {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    
    this.handlers[event].push(handler);
    
    // Return unsubscribe function
    return () => {
      this.handlers[event] = this.handlers[event].filter(h => h !== handler);
    };
  }
  
  /**
   * Publish an event with data
   */
  publish(event: string, ...args: any[]): void {
    const handlers = this.handlers[event];
    if (handlers) {
      handlers.forEach(handler => handler(...args));
    }
  }
  
  /**
   * Clear all event handlers
   */
  clear(): void {
    this.handlers = {};
  }
}

// Create a singleton instance
export const eventBus = new EventBus();

// Event types
export const DiagramEvents = {
  ELEMENT_ADDED: 'element:added',
  ELEMENT_REMOVED: 'element:removed',
  ELEMENT_UPDATED: 'element:updated',
  ELEMENT_SELECTED: 'element:selected',
  RELATIONSHIP_ADDED: 'relationship:added',
  RELATIONSHIP_REMOVED: 'relationship:removed',
  RELATIONSHIP_UPDATED: 'relationship:updated',
  RELATIONSHIP_SELECTED: 'relationship:selected',
  DIAGRAM_CHANGED: 'diagram:changed',
  DIAGRAM_CLEARED: 'diagram:cleared'
};
