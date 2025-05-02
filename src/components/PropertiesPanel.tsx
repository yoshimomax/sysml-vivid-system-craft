
import { useState, useEffect } from "react";
import { Element } from "@/types/sysml";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronUp, ChevronDown } from "lucide-react";

interface PropertiesPanelProps {
  selectedElement: Element | null;
  onElementUpdate: (updatedElement: Element) => void;
}

interface PropertyGroupProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const PropertyGroup = ({ title, defaultOpen = true, children }: PropertyGroupProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        className="w-full flex items-center justify-between p-2 hover:bg-muted/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm font-medium">{title}</span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {isOpen && (
        <div className="p-3 space-y-3 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};

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
        <div className="space-y-2">
          <div>
            <Label htmlFor="elementType">Type</Label>
            <Input
              id="elementType"
              value={selectedElement.type}
              disabled
              className="bg-muted/50"
            />
          </div>

          <div>
            <Label htmlFor="elementName">Name</Label>
            <Input
              id="elementName"
              value={formValues.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="elementStereotype">Stereotype</Label>
            <Input
              id="elementStereotype"
              value={formValues.stereotype || ""}
              onChange={(e) => handleInputChange("stereotype", e.target.value)}
              placeholder="e.g. system, interface"
            />
          </div>

          <div>
            <Label htmlFor="elementDescription">Description</Label>
            <Textarea
              id="elementDescription"
              value={formValues.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe this element..."
              rows={3}
            />
          </div>
        </div>
      </PropertyGroup>

      <PropertyGroup title="Position & Size">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="elementPosX">Position X</Label>
            <Input
              id="elementPosX"
              type="number"
              value={selectedElement.position.x.toFixed(0)}
              disabled
              className="bg-muted/50"
            />
          </div>
          <div>
            <Label htmlFor="elementPosY">Position Y</Label>
            <Input
              id="elementPosY"
              type="number"
              value={selectedElement.position.y.toFixed(0)}
              disabled
              className="bg-muted/50"
            />
          </div>
          <div>
            <Label htmlFor="elementWidth">Width</Label>
            <Input
              id="elementWidth"
              type="number"
              value={selectedElement.size.width}
              disabled
              className="bg-muted/50"
            />
          </div>
          <div>
            <Label htmlFor="elementHeight">Height</Label>
            <Input
              id="elementHeight"
              type="number"
              value={selectedElement.size.height}
              disabled
              className="bg-muted/50"
            />
          </div>
        </div>
      </PropertyGroup>

      {selectedElement.type === "Block" && (
        <PropertyGroup title="Block Specific">
          <p className="text-xs text-muted-foreground">Additional block properties will appear here</p>
        </PropertyGroup>
      )}

      {selectedElement.type === "Requirement" && (
        <PropertyGroup title="Requirement Specific">
          <div className="space-y-2">
            <div>
              <Label htmlFor="reqId">ID</Label>
              <Input
                id="reqId"
                value={selectedElement.properties?.reqId || ""}
                onChange={(e) => {
                  const updatedProps = {
                    ...selectedElement.properties,
                    reqId: e.target.value,
                  };
                  handleInputChange("properties", updatedProps);
                }}
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Input
                id="priority"
                value={selectedElement.properties?.priority || ""}
                onChange={(e) => {
                  const updatedProps = {
                    ...selectedElement.properties,
                    priority: e.target.value,
                  };
                  handleInputChange("properties", updatedProps);
                }}
                placeholder="High/Medium/Low"
              />
            </div>
          </div>
        </PropertyGroup>
      )}
    </div>
  );
};

export default PropertiesPanel;
