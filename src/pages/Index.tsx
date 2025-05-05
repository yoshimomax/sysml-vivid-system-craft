
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Diagram, Element, ElementType, Relationship } from "@/types/sysml";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import ModelingHeader from "@/components/ModelingHeader";
import ElementsPanel from "@/components/ElementsPanel";
import ModelingCanvas from "@/components/ModelingCanvas";
import PropertiesPanel from "@/components/PropertiesPanel";
import DiagramTabs from "@/components/DiagramTabs";

const Index = () => {
  const [diagrams, setDiagrams] = useState<Diagram[]>([
    {
      id: uuidv4(),
      name: "Main Diagram",
      type: "Structure",
      elements: [],
      relationships: [],
    },
  ]);
  const [activeDiagramId, setActiveDiagramId] = useState<string>(diagrams[0].id);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [selectedRelationship, setSelectedRelationship] = useState<Relationship | null>(null);
  const { toast } = useToast();

  const activeDiagram = diagrams.find((d) => d.id === activeDiagramId) || diagrams[0];
  const elements = activeDiagram.elements;
  const relationships = activeDiagram.relationships;

  const handleElementDragStart = (type: ElementType) => {
    console.log(`Started dragging a ${type} element`);
  };

  const handleElementUpdate = (updatedElement: Element) => {
    const updatedElements = elements.map((el) =>
      el.id === updatedElement.id ? updatedElement : el
    );

    updateDiagramElements(updatedElements);
    
    // Also update the selected element reference
    if (selectedElement && selectedElement.id === updatedElement.id) {
      setSelectedElement(updatedElement);
    }
  };

  const handleRelationshipUpdate = (updatedRelationship: Relationship) => {
    const updatedRelationships = relationships.map((rel) =>
      rel.id === updatedRelationship.id ? updatedRelationship : rel
    );

    updateDiagramRelationships(updatedRelationships);
    
    // Also update the selected relationship reference
    if (selectedRelationship && selectedRelationship.id === updatedRelationship.id) {
      setSelectedRelationship(updatedRelationship);
    }
  };

  const handleRelationshipSelect = (relationshipId: string) => {
    // Deselect element when selecting a relationship
    setSelectedElement(null);
    
    const relationship = relationships.find(r => r.id === relationshipId);
    setSelectedRelationship(relationship || null);
  };

  const updateDiagramElements = (newElements: Element[]) => {
    setDiagrams(
      diagrams.map((diagram) => {
        if (diagram.id === activeDiagramId) {
          return {
            ...diagram,
            elements: newElements,
          };
        }
        return diagram;
      })
    );
  };

  const updateDiagramRelationships = (newRelationships: Relationship[]) => {
    setDiagrams(
      diagrams.map((diagram) => {
        if (diagram.id === activeDiagramId) {
          return {
            ...diagram,
            relationships: newRelationships,
          };
        }
        return diagram;
      })
    );
  };

  const handleAddDiagram = () => {
    const newDiagram: Diagram = {
      id: uuidv4(),
      name: `New Diagram ${diagrams.length + 1}`,
      type: "Structure",
      elements: [],
      relationships: [],
    };

    setDiagrams([...diagrams, newDiagram]);
    setActiveDiagramId(newDiagram.id);
    setSelectedElement(null);
    setSelectedRelationship(null);

    toast({
      title: "Diagram created",
      description: `Created new diagram: ${newDiagram.name}`,
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

    const updatedDiagrams = diagrams.filter((d) => d.id !== diagramId);
    setDiagrams(updatedDiagrams);

    // If we closed the active diagram, switch to the first available
    if (diagramId === activeDiagramId) {
      setActiveDiagramId(updatedDiagrams[0].id);
      setSelectedElement(null);
      setSelectedRelationship(null);
    }

    toast({
      title: "Diagram closed",
      description: "Diagram has been closed",
    });
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <ModelingHeader />
      
      <DiagramTabs
        diagrams={diagrams}
        activeDiagramId={activeDiagramId}
        onDiagramSelect={setActiveDiagramId}
        onAddDiagram={handleAddDiagram}
        onCloseDiagram={handleCloseDiagram}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Elements Panel (Left Sidebar) */}
        <div className="w-60 border-r border-border bg-card overflow-y-auto">
          <ElementsPanel onElementDragStart={handleElementDragStart} />
        </div>
        
        {/* Main Canvas */}
        <div className="flex-1 overflow-hidden">
          <ModelingCanvas
            elements={elements}
            setElements={updateDiagramElements}
            relationships={relationships}
            setRelationships={updateDiagramRelationships}
            selectedElement={selectedElement}
            setSelectedElement={(element) => {
              setSelectedElement(element);
              setSelectedRelationship(null); // Deselect relationship when selecting an element
            }}
          />
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
