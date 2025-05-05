
import { Element } from "@/types/sysml";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ActionPropertiesProps {
  element: Element;
  onPropertyChange: (propertyName: string, value: string) => void;
}

const ActionProperties = ({ element, onPropertyChange }: ActionPropertiesProps) => {
  const properties = element.properties || {};

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="isParallel">Is Parallel</Label>
        <Select 
          value={properties.isParallel || "false"} 
          onValueChange={(value) => onPropertyChange("isParallel", value)}
        >
          <SelectTrigger id="isParallel">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">True</SelectItem>
            <SelectItem value="false">False</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="actionKind">Action Kind</Label>
        <Select 
          value={properties.actionKind || "normal"} 
          onValueChange={(value) => onPropertyChange("actionKind", value)}
        >
          <SelectTrigger id="actionKind">
            <SelectValue placeholder="Select action kind" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="accept">Accept</SelectItem>
            <SelectItem value="send">Send</SelectItem>
            <SelectItem value="composite">Composite</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="guard">Guard Expression</Label>
        <Input
          id="guard"
          value={properties.guard || ""}
          onChange={(e) => onPropertyChange("guard", e.target.value)}
          placeholder="Enter guard condition"
        />
      </div>
    </div>
  );
};

export default ActionProperties;
