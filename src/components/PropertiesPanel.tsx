
import { useState, useEffect } from "react";
import { Element } from "@/types/sysml";
import PropertyGroup from "./properties/PropertyGroup";
import GeneralProperties from "./properties/GeneralProperties";
import PositionSizeProperties from "./properties/PositionSizeProperties";
import RequirementProperties from "./properties/RequirementProperties";

interface PropertiesPanelProps {
  selectedElement: Element | null;
  onElementUpdate: (updatedElement: Element) => void;
}

const PropertiesPanel = ({ selectedElement, onElementUpdate }: PropertiesPanelProps) => {
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

  if (!selectedElement) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>Select an element to view properties</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="sidebar-group-title">Element Properties</div>

      <PropertyGroup title="General">
        <GeneralProperties 
          formValues={formValues} 
          handleInputChange={handleInputChange}
          elementType={selectedElement.type}
        />
      </PropertyGroup>

      <PropertyGroup title="Position & Size">
        <PositionSizeProperties element={selectedElement} />
      </PropertyGroup>

      {selectedElement.type === "Part" && (
        <PropertyGroup title="Part Specific">
          <p className="text-xs text-muted-foreground">Additional part properties will appear here</p>
        </PropertyGroup>
      )}

      {selectedElement.type === "Requirement" && (
        <PropertyGroup title="Requirement Specific">
          <RequirementProperties 
            element={selectedElement} 
            onPropertyChange={handlePropertiesChange} 
          />
        </PropertyGroup>
      )}
    </div>
  );
};

export default PropertiesPanel;
