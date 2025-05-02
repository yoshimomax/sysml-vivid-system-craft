
import { Element } from "@/types/sysml";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface GeneralPropertiesProps {
  formValues: Partial<Element>;
  handleInputChange: (field: string, value: string) => void;
  elementType: string;
}

const GeneralProperties = ({ formValues, handleInputChange, elementType }: GeneralPropertiesProps) => {
  return (
    <div className="space-y-2">
      <div>
        <Label htmlFor="elementType">Type</Label>
        <Input
          id="elementType"
          value={elementType}
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
  );
};

export default GeneralProperties;
