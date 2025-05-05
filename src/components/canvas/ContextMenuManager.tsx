
import React from "react";
import { Position, RelationshipType } from "../../model/types";
import { RelationshipCreator } from "./RelationshipCreator";

interface ContextMenuManagerProps {
  contextMenuPosition: Position | null;
  elementForContextMenu: string | null;
  onSelectRelationshipType: (type: RelationshipType) => void;
  onCancel: () => void;
}

export const ContextMenuManager: React.FC<ContextMenuManagerProps> = ({
  contextMenuPosition,
  elementForContextMenu,
  onSelectRelationshipType,
  onCancel
}) => {
  if (!contextMenuPosition || !elementForContextMenu) return null;
  
  return (
    <RelationshipCreator
      visible={true}
      position={contextMenuPosition}
      onSelectType={onSelectRelationshipType}
      onCancel={onCancel}
    />
  );
};
