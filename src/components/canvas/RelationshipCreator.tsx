
import React from "react";
import { RelationshipType } from "../../model/types";
import { Menu } from "@/components/ui/menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface RelationshipCreatorProps {
  visible: boolean;
  position: { x: number; y: number };
  onSelectType: (type: RelationshipType) => void;
  onCancel: () => void;
}

export const RelationshipCreator: React.FC<RelationshipCreatorProps> = ({
  visible,
  position,
  onSelectType,
  onCancel
}) => {
  if (!visible) return null;
  
  // SysML v2 relationship types based on documentation
  const relationshipTypes: { type: RelationshipType; label: string; description: string }[] = [
    { 
      type: "Dependency", 
      label: "Dependency", 
      description: "General dependency relationship" 
    },
    { 
      type: "Specialization", 
      label: "Specialization", 
      description: "Type specialization" 
    },
    { 
      type: "Reference", 
      label: "Reference", 
      description: "Feature reference" 
    },
    { 
      type: "Containment", 
      label: "Containment", 
      description: "Containment relationship" 
    },
    { 
      type: "Composition", 
      label: "Composition", 
      description: "Composite aggregation" 
    },
    { 
      type: "Association", 
      label: "Association", 
      description: "General association" 
    }
  ];
  
  return (
    <div
      className="absolute bg-card rounded-md shadow-md border p-1 z-50 w-48"
      style={{
        left: position.x,
        top: position.y
      }}
    >
      <div className="text-sm font-medium p-2 border-b">Create Relationship</div>
      <ScrollArea className="max-h-64">
        <div className="space-y-1 p-1">
          {relationshipTypes.map((item) => (
            <Button
              key={item.type}
              variant="ghost"
              className="w-full justify-start text-sm h-8 px-2"
              onClick={() => onSelectType(item.type)}
            >
              <span>{item.label}</span>
              <span className="ml-auto text-xs text-muted-foreground truncate max-w-[100px]">
                {item.description}
              </span>
            </Button>
          ))}
        </div>
      </ScrollArea>
      <div className="pt-1 pb-1 border-t mt-1">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
