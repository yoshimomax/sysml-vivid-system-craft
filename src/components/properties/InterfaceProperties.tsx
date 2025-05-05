
import { Element } from "@/types/sysml";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface InterfacePropertiesProps {
  element: Element;
  onPropertyChange: (propertyName: string, value: string) => void;
}

const InterfaceProperties = ({ element, onPropertyChange }: InterfacePropertiesProps) => {
  const properties = element.properties || {};

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="protocol">Protocol</Label>
        <Input
          id="protocol"
          value={properties.protocol || ""}
          onChange={(e) => onPropertyChange("protocol", e.target.value)}
          placeholder="Enter protocol"
        />
      </div>
      
      <div>
        <Label htmlFor="interfaceSpec">Interface Specification</Label>
        <Textarea
          id="interfaceSpec"
          value={properties.interfaceSpec || ""}
          onChange={(e) => onPropertyChange("interfaceSpec", e.target.value)}
          placeholder="Enter interface specification"
          className="h-20"
        />
      </div>
    </div>
  );
};

export default InterfaceProperties;
