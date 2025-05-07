
// Import existing code or create if it doesn't exist
export const eventBus = {
  events: {} as Record<string, Array<(data?: any) => void>>,
  
  subscribe(event: string, callback: (data?: any) => void) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    
    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    };
  },
  
  publish(event: string, data?: any) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }
};

// Define diagram events
export const DiagramEvents = {
  DIAGRAM_CHANGED: 'diagram:changed',
  ELEMENT_ADDED: 'element:added',
  ELEMENT_UPDATED: 'element:updated',
  ELEMENT_REMOVED: 'element:removed',
  ELEMENT_SELECTED: 'element:selected',
  ELEMENT_DELETED: 'element:deleted',
  RELATIONSHIP_ADDED: 'relationship:added',
  RELATIONSHIP_UPDATED: 'relationship:updated',
  RELATIONSHIP_REMOVED: 'relationship:removed',
  RELATIONSHIP_SELECTED: 'relationship:selected',
  RELATIONSHIP_DELETED: 'relationship:deleted'
};

// DiagramEventsExtended is now imported from modelingStore.ts
// to avoid circular dependencies
