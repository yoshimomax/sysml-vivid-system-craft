
import { Element } from "@/types/sysml";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface StatePropertiesProps {
  element: Element;
  onPropertyChange: (propertyName: string, value: string) => void;
}

const StateProperties = ({ element, onPropertyChange }: StatePropertiesProps) => {
  const properties = element.properties || {};

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="isInitial">Is Initial</Label>
        <Select 
          value={properties.isInitial || "false"} 
          onValueChange={(value) => onPropertyChange("isInitial", value)}
        >
          <SelectTrigger id="isInitial">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">True</SelectItem>
            <SelectItem value="false">False</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="isFinal">Is Final</Label>
        <Select 
          value={properties.isFinal || "false"} 
          onValueChange={(value) => onPropertyChange("isFinal", value)}
        >
          <SelectTrigger id="isFinal">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">True</SelectItem>
            <SelectItem value="false">False</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="entryAction">Entry Action</Label>
        <Input
          id="entryAction"
          value={properties.entryAction || ""}
          onChange={(e) => onPropertyChange("entryAction", e.target.value)}
          placeholder="State entry action"
        />
      </div>
      
      <div>
        <Label htmlFor="exitAction">Exit Action</Label>
        <Input
          id="exitAction"
          value={properties.exitAction || ""}
          onChange={(e) => onPropertyChange("exitAction", e.target.value)}
          placeholder="State exit action"
        />
      </div>
      
      <div>
        <Label htmlFor="doActivity">Do Activity</Label>
        <Textarea
          id="doActivity"
          value={properties.doActivity || ""}
          onChange={(e) => onPropertyChange("doActivity", e.target.value)}
          placeholder="Enter activity performed while in state"
          className="h-20"
        />
      </div>
    </div>
  );
};

export default StateProperties;
