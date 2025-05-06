
import { Relationship } from "@/types/sysml";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onRelationshipUpdate({
      ...relationship,
      label: e.target.value
    });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onRelationshipUpdate({
      ...relationship,
      description: e.target.value
    });
  };

  const handleTypeChange = (value: string) => {
    onRelationshipUpdate({
      ...relationship,
      type: value as any // The type is validated by the select options
    });
  };

  const handleLineStyleChange = (value: string) => {
    onRelationshipUpdate({
      ...relationship,
      properties: {
        ...relationship.properties,
        lineStyle: value as any
      }
    });
  };

  // Default properties if not set
  const properties = relationship.properties || {};
  const lineStyle = properties.lineStyle || 
    (relationship.type === 'Dependency' ? 'dashed' : 
     relationship.type === 'Allocate' ? 'dotted' : 'solid');

  return (
    <div className="space-y-3">
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
        <Label htmlFor="relationshipLabel">Label (shown on diagram)</Label>
        <Input
          id="relationshipLabel"
          value={relationship.label || ""}
          onChange={handleLabelChange}
          placeholder="Label (optional)"
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
            <SelectItem value="Allocate">Allocate</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="lineStyle">Line Style</Label>
        <Select 
          value={lineStyle} 
          onValueChange={handleLineStyleChange}
        >
          <SelectTrigger id="lineStyle">
            <SelectValue placeholder="Select line style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">Solid</SelectItem>
            <SelectItem value="dashed">Dashed</SelectItem>
            <SelectItem value="dotted">Dotted</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="relationshipDescription">Description</Label>
        <Textarea
          id="relationshipDescription"
          value={relationship.description || ""}
          onChange={handleDescriptionChange}
          placeholder="Describe this relationship..."
          rows={3}
        />
      </div>
    </div>
  );
};

export default RelationshipProperties;
