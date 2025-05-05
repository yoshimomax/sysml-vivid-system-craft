
import { Element } from "@/types/sysml";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ClassPropertiesProps {
  element: Element;
  onPropertyChange: (propertyName: string, value: string) => void;
}

const ClassProperties = ({ element, onPropertyChange }: ClassPropertiesProps) => {
  const properties = element.properties || {};

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="isAbstract">Is Abstract</Label>
        <Select 
          value={properties.isAbstract || "false"} 
          onValueChange={(value) => onPropertyChange("isAbstract", value)}
        >
          <SelectTrigger id="isAbstract">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">True</SelectItem>
            <SelectItem value="false">False</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="namespace">Namespace</Label>
        <Input
          id="namespace"
          value={properties.namespace || ""}
          onChange={(e) => onPropertyChange("namespace", e.target.value)}
          placeholder="Enter namespace"
        />
      </div>
    </div>
  );
};

export default ClassProperties;
