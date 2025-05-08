
import React from "react";
import { RelationshipType } from "../../model/types";
import { Button } from "../ui/button";
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger 
} from "../ui/context-menu";

interface RelationshipCreatorProps {
  visible: boolean;
  position: { x: number, y: number };
  onSelectType: (type: RelationshipType) => void;
  onCancel?: () => void;
}

export const RelationshipCreator: React.FC<RelationshipCreatorProps> = ({
  visible,
  position,
  onSelectType,
  onCancel
}) => {
  if (!visible || !position) return null;

  // Available relationship types
  const relationshipTypes: RelationshipType[] = [
    'Specialization',
    'Dependency',
    'Containment',
    'Reference',
    'Subsetting',
    'Redefinition',
    'Binding',
    'ItemFlowConnection',
    'Satisfy',
    'Verify',
    'Allocate'
  ];

  // Get friendly names for relationship types
  const getRelationshipName = (type: RelationshipType) => {
    const names: Record<RelationshipType, string> = {
      'Specialization': 'Generalization',
      'Dependency': 'Dependency',
      'Containment': 'Composition',
      'Reference': 'Association',
      'Subsetting': 'Subset',
      'Redefinition': 'Redefine',
      'Binding': 'Binding',
      'ItemFlowConnection': 'Item Flow',
      'Satisfy': 'Satisfy',
      'Verify': 'Verify',
      'Allocate': 'Allocate'
    };
    return names[type] || type;
  };

  return (
    <div className="bg-card border rounded shadow-lg p-1 z-50">
      <div className="text-sm font-medium px-2 py-1 border-b mb-1">
        Create Relationship
      </div>
      <div className="max-h-64 overflow-y-auto">
        {relationshipTypes.map(type => (
          <Button
            key={type}
            variant="ghost"
            className="w-full justify-start text-left text-sm py-1"
            onClick={() => onSelectType(type)}
          >
            {getRelationshipName(type)}
          </Button>
        ))}
      </div>
    </div>
  );
};
