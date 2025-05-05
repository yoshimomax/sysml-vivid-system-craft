
import { Relationship } from "@/types/sysml";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RelationshipPropertiesProps {
  relationship: Relationship;
  onRelationshipUpdate: (relationship: Relationship) => void;
}

const RelationshipProperties = ({ relationship, onRelationshipUpdate }: RelationshipPropertiesProps) => {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onRelationshipUpdate({
      ...relationship,
      name: e.target.value
    });
  };

  const handleTypeChange = (value: string) => {
    onRelationshipUpdate({
      ...relationship,
      type: value as any // The type is validated by the select options
    });
  };

  return (
    <div className="space-y-2">
      <div>
        <Label htmlFor="relationshipName">Name</Label>
        <Input
          id="relationshipName"
          value={relationship.name || ""}
          onChange={handleNameChange}
          placeholder="Relationship name"
        />
      </div>
      
      <div>
        <Label htmlFor="relationshipType">Type</Label>
        <Select 
          value={relationship.type} 
          onValueChange={handleTypeChange}
        >
          <SelectTrigger id="relationshipType">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Specialization">Specialization</SelectItem>
            <SelectItem value="Dependency">Dependency</SelectItem>
            <SelectItem value="Containment">Containment</SelectItem>
            <SelectItem value="Reference">Reference</SelectItem>
            <SelectItem value="Subsetting">Subsetting</SelectItem>
            <SelectItem value="Redefinition">Redefinition</SelectItem>
            <SelectItem value="Binding">Binding</SelectItem>
            <SelectItem value="ItemFlowConnection">Item Flow</SelectItem>
            <SelectItem value="Satisfy">Satisfy</SelectItem>
            <SelectItem value="Verify">Verify</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default RelationshipProperties;
