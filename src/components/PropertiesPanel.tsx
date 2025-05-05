
import { useState, useEffect } from "react";
import { Element, Relationship } from "@/types/sysml";
import PropertyGroup from "./properties/PropertyGroup";
import GeneralProperties from "./properties/GeneralProperties";
import PositionSizeProperties from "./properties/PositionSizeProperties";
import RequirementProperties from "./properties/RequirementProperties";
import RelationshipProperties from "./properties/RelationshipProperties";

interface PropertiesPanelProps {
  selectedElement: Element | null;
  selectedRelationship: Relationship | null;
  onElementUpdate: (updatedElement: Element) => void;
  onRelationshipUpdate: (updatedRelationship: Relationship) => void;
}

const PropertiesPanel = ({ 
  selectedElement, 
  selectedRelationship,
  onElementUpdate, 
  onRelationshipUpdate 
}: PropertiesPanelProps) => {
  const [formValues, setFormValues] = useState<Partial<Element>>({});

  useEffect(() => {
    if (selectedElement) {
      setFormValues({
        name: selectedElement.name,
        description: selectedElement.description || "",
        stereotype: selectedElement.stereotype || "",
      });
    } else {
      setFormValues({});
    }
  }, [selectedElement]);

  const handleInputChange = (field: string, value: string) => {
    setFormValues({
      ...formValues,
      [field]: value,
    });

    if (selectedElement) {
      onElementUpdate({
        ...selectedElement,
        [field]: value,
      });
    }
  };

  const handlePropertiesChange = (propertyName: string, value: string) => {
    if (!selectedElement) return;

    const updatedProperties = {
      ...selectedElement.properties,
      [propertyName]: value
    };

    onElementUpdate({
      ...selectedElement,
      properties: updatedProperties
    });
  };

  if (!selectedElement && !selectedRelationship) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>Select an element or relationship to view properties</p>
      </div>
    );
  }

  // Render relationship properties
  if (selectedRelationship) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="sidebar-group-title">Relationship Properties</div>

        <PropertyGroup title="Relationship">
          <RelationshipProperties 
            relationship={selectedRelationship}
            onRelationshipUpdate={onRelationshipUpdate}
          />
        </PropertyGroup>
      </div>
    );
  }

  // Render element properties
  return (
    <div className="h-full overflow-y-auto">
      <div className="sidebar-group-title">Element Properties</div>

      <PropertyGroup title="General">
        <GeneralProperties 
          formValues={formValues} 
          handleInputChange={handleInputChange}
          elementType={selectedElement!.type}
        />
      </PropertyGroup>

      <PropertyGroup title="Position & Size">
        <PositionSizeProperties element={selectedElement!} />
      </PropertyGroup>

      {selectedElement!.type === "Part" && (
        <PropertyGroup title="Part Specific">
          <p className="text-xs text-muted-foreground">Additional part properties will appear here</p>
        </PropertyGroup>
      )}

      {selectedElement!.type === "Requirement" && (
        <PropertyGroup title="Requirement Specific">
          <RequirementProperties 
            element={selectedElement!} 
            onPropertyChange={handlePropertiesChange} 
          />
        </PropertyGroup>
      )}
    </div>
  );
};

export default PropertiesPanel;
