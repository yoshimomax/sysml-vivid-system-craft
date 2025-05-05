
import React, { useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import ModelingHeader from "@/components/ModelingHeader";
import DiagramTabs from "@/components/DiagramTabs";
import { ElementsPanel } from "@/components/panels/ElementsPanel";
import { ModelingCanvas } from "@/components/canvas/ModelingCanvas";
import PropertiesPanel from "@/components/PropertiesPanel";
import { useModelingStore } from "@/store/modelingStore";
import { v4 as uuidv4 } from "uuid";

const Index = () => {
  const { toast } = useToast();
  const project = useModelingStore(state => state.project);
  const activeDiagramId = useModelingStore(state => state.activeDiagramId);
  const selectDiagram = useModelingStore(state => state.selectDiagram);
  const addDiagram = useModelingStore(state => state.addDiagram);
  const removeDiagram = useModelingStore(state => state.removeDiagram);
  
  // Initialize active diagram if not set
  useEffect(() => {
    if (project.diagrams.length > 0 && !activeDiagramId) {
      selectDiagram(project.diagrams[0].id);
    }
  }, [project, activeDiagramId, selectDiagram]);

  const handleAddDiagram = () => {
    addDiagram(`New Diagram ${project.diagrams.length + 1}`, 'Structure');

    toast({
      title: "Diagram created",
      description: `Created new diagram: New Diagram ${project.diagrams.length + 1}`,
    });
  };

  const handleCloseDiagram = (diagramId: string) => {
    // Don't allow closing the last diagram
    if (project.diagrams.length <= 1) {
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

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <ModelingHeader />
      
      <DiagramTabs
        diagrams={project.diagrams}
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
          <PropertiesPanel />
        </div>
      </div>
    </div>
  );
};

export default Index;
