
import React, { useEffect, useMemo } from "react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import ModelingHeader from "@/components/ModelingHeader";
import DiagramTabs from "@/components/DiagramTabs";
import { ElementsPanel } from "@/components/panels/ElementsPanel";
import { ModelingCanvas } from "@/components/canvas/ModelingCanvas"; // Ensure we're using the advanced one
import PropertiesPanel from "@/components/PropertiesPanel";
import { useModelingStore } from "@/store/modelingStore";
import { Element, Relationship } from "@/model/types"; // Changed from types/sysml to model/types

const Index = () => {
  const { toast } = useToast();
  
  // Use selectors with primitive values where possible to prevent unnecessary rerenders
  const projectId = useModelingStore(state => state.project.id);
  const diagrams = useModelingStore(state => state.project.diagrams);
  const activeDiagramId = useModelingStore(state => state.activeDiagramId);
  
  // Memoize store functions to prevent unnecessary renders
  const selectDiagram = useMemo(() => useModelingStore.getState().selectDiagram, []);
  const addDiagram = useMemo(() => useModelingStore.getState().addDiagram, []);
  const removeDiagram = useMemo(() => useModelingStore.getState().removeDiagram, []);
  const updateElement = useMemo(() => useModelingStore.getState().updateElement, []);
  const updateRelationship = useMemo(() => useModelingStore.getState().updateRelationship, []);
  
  // Get selected elements outside of render to prevent infinite loops
  const selectedElement = useModelingStore(state => state.getSelectedElement());
  const selectedRelationship = useModelingStore(state => state.getSelectedRelationship());
  
  // Initialize active diagram if not set
  useEffect(() => {
    if (diagrams.length > 0 && !activeDiagramId) {
      selectDiagram(diagrams[0].id);
    }
  }, [diagrams, activeDiagramId, selectDiagram]);

  const handleAddDiagram = () => {
    addDiagram(`New Diagram ${diagrams.length + 1}`, 'Structure');

    toast({
      title: "Diagram created",
      description: `Created new diagram: New Diagram ${diagrams.length + 1}`,
    });
  };

  const handleCloseDiagram = (diagramId: string) => {
    // Don't allow closing the last diagram
    if (diagrams.length <= 1) {
      toast({
        title: "Cannot close diagram",
        description: "At least one diagram must remain open",
        variant: "destructive",
      });
      return;
    }

    removeDiagram(diagramId);

    toast({
      title: "Diagram closed",
      description: "Diagram has been closed",
    });
  };

  // Handlers for updating elements and relationships
  const handleElementUpdate = (element: Element) => {
    updateElement(element.id, element);
  };

  const handleRelationshipUpdate = (relationship: Relationship) => {
    updateRelationship(relationship.id, relationship);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <ModelingHeader />
      
      <DiagramTabs
        diagrams={diagrams}
        activeDiagramId={activeDiagramId}
        onDiagramSelect={selectDiagram}
        onAddDiagram={handleAddDiagram}
        onCloseDiagram={handleCloseDiagram}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Elements Panel (Left Sidebar) */}
        <div className="w-60 border-r border-border bg-card overflow-y-auto">
          <ElementsPanel />
        </div>
        
        {/* Main Canvas */}
        <div className="flex-1 overflow-hidden">
          <ModelingCanvas />
        </div>
        
        {/* Properties Panel (Right Sidebar) */}
        <div className="w-72 border-l border-border bg-card overflow-y-auto">
          <PropertiesPanel 
            selectedElement={selectedElement}
            selectedRelationship={selectedRelationship}
            onElementUpdate={handleElementUpdate}
            onRelationshipUpdate={handleRelationshipUpdate}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
