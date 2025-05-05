
import { Element } from "@/types/sysml";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PartPropertiesProps {
  element: Element;
  onPropertyChange: (propertyName: string, value: string) => void;
}

const PartProperties = ({ element, onPropertyChange }: PartPropertiesProps) => {
  const properties = element.properties || {};
  
  const handleMultiplicityChange = (value: string) => {
    onPropertyChange("multiplicity", value);
  };
  
  const handleIsAbstractChange = (value: string) => {
    onPropertyChange("isAbstract", value);
  };

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="multiplicity">Multiplicity</Label>
        <Input
          id="multiplicity"
          value={properties.multiplicity || ""}
          onChange={(e) => onPropertyChange("multiplicity", e.target.value)}
          placeholder="1, 0..1, 0..*, 1..*"
        />
      </div>
      
      <div>
        <Label htmlFor="isAbstract">Is Abstract</Label>
        <Select 
          value={properties.isAbstract || "false"} 
          onValueChange={handleIsAbstractChange}
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
        <Label htmlFor="isPortion">Is Portion</Label>
        <Select 
          value={properties.isPortion || "false"} 
          onValueChange={(value) => onPropertyChange("isPortion", value)}
        >
          <SelectTrigger id="isPortion">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">True</SelectItem>
            <SelectItem value="false">False</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default PartProperties;
