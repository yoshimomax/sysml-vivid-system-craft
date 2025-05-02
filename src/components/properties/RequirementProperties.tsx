
import { Element } from "@/types/sysml";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RequirementPropertiesProps {
  element: Element;
  onPropertyChange: (propertyName: string, value: string) => void;
}

const RequirementProperties = ({ element, onPropertyChange }: RequirementPropertiesProps) => {
  return (
    <div className="space-y-2">
      <div>
        <Label htmlFor="reqId">ID</Label>
        <Input
          id="reqId"
          value={element.properties?.reqId || ""}
          onChange={(e) => onPropertyChange("reqId", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="priority">Priority</Label>
        <Input
          id="priority"
          value={element.properties?.priority || ""}
          onChange={(e) => onPropertyChange("priority", e.target.value)}
          placeholder="High/Medium/Low"
        />
      </div>
    </div>
  );
};

export default RequirementProperties;
